import express from 'express';
import Lead from '../models/Lead';
import Client from '../models/Client';
import Campaign from '../models/Campaign';
import Transaction from '../models/Transaction';
import { sendMetaConversionEvent } from '../utils/metaCAPI';
import { engine } from '../worker/AutomationEngine';

const router = express.Router();

// --- LEADS ROUTES ---

// GET /api/crm/leads - Listar todos os leads
router.get('/leads', async (req, res) => {
  try {
    const query = req.user?.role === 'client' ? { clientId: req.user.clientId } : {};
    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar leads' });
  }
});

// POST /api/crm/leads - Criar novo lead
router.post('/leads', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    const saved = await newLead.save();
    
    // 🔥 Aciona o motor de automações em tempo real
    engine.triggerFlows('Formulário do Site', saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar lead' });
  }
});

// PUT /api/crm/lead/:id - Atualizar lead (ex: mover status no Kanban)
router.put('/lead/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Pega o estado ANTERIOR para sabermos se o status MUDOU (Kanban Drag)
    const oldLead = await Lead.findById(req.params.id);

    // Atualiza no banco
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (updatedLead) {
      // 🔥 Dispara Automações de WhatsApp se o Status MUDOU
      if (oldLead && oldLead.status !== status) {
        if (status === 'won') {
          engine.triggerFlows('Lead Ganho', updatedLead);
        } else if (status === 'qualified') {
          engine.triggerFlows('Lead Qualificado', updatedLead);
        } else if (status === 'contacted') {
          engine.triggerFlows('Lead Contatado', updatedLead);
        } else if (status === 'proposal') {
          engine.triggerFlows('Lead Proposta', updatedLead);
        }
      }

      // Verifica mudanças de status para disparar a CAPI da Meta
      if (status === 'won') {
        try {
          // Passa o valor ganho para otimizar ROAS no Facebook
          await sendMetaConversionEvent(
            'Purchase', 
            { email: updatedLead.email, phone: updatedLead.phone, clientIp: req.ip },
            { value: updatedLead.value || 0, currency: 'BRL' }
          );
        } catch (capiError) {
          console.warn('⚠️ Erro ao enviar evento de conversão Meta CAPI (Purchase):', capiError);
        }
      } else if (status === 'qualified') {
        try {
          await sendMetaConversionEvent(
            'QualifyLead', 
            { email: updatedLead.email, phone: updatedLead.phone, clientIp: req.ip }
          );
        } catch (capiError) {
          console.warn('⚠️ Erro ao enviar evento de conversão Meta CAPI (QualifyLead):', capiError);
        }
      }
      res.json(updatedLead);
    } else {
      res.status(404).json({ error: 'Lead não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar lead' });
  }
});

// DELETE /api/crm/lead/:id - Deletar um lead
router.delete('/lead/:id', async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Lead removido com sucesso' });
    } else {
      res.status(404).json({ error: 'Lead não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover lead' });
  }
});


// --- CLIENTS ROUTES ---

// GET /api/crm/clients - Listar todos os clientes
router.get('/clients', async (req, res) => {
  try {
    // Para o modelo Client, a comparação é com o _id do documento
    const query = req.user?.role === 'client' ? { _id: req.user.clientId } : {};
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// POST /api/crm/clients - Criar/Registrar novo contrato de cliente
router.post('/clients', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const saved = await newClient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar cliente' });
  }
});

// PUT /api/crm/client/:id - Atualizar cliente
router.put('/client/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedClient) {
      res.json(updatedClient);
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// POST /api/crm/client/:id/user - Gerar acesso (usuário) para o cliente
router.post('/client/:id/user', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (!client.email) {
      return res.status(400).json({ error: 'Cliente não possui email cadastrado' });
    }

    // Check se já existe
    const { default: User } = await import('../models/User');
    const { default: bcrypt } = await import('bcryptjs');

    const existingUser = await User.findOne({ email: client.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Já existe um usuário com este email' });
    }

    // Cria senha aleatória de 6 dígitos
    const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const newUser = await User.create({
      name: client.name,
      email: client.email,
      passwordHash,
      role: 'client',
      clientId: client.id
    });

    res.status(201).json({
      message: 'Acesso criado com sucesso',
      email: newUser.email,
      tempPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar acesso do cliente' });
  }
});

// DELETE /api/crm/client/:id - Remover/Cancelar contrato de cliente
router.delete('/client/:id', async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Contrato de cliente cancelado' });
    } else {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
});


// --- TRANSACTIONS ROUTES ---

// GET /api/crm/transactions - Listar transações
router.get('/transactions', async (req, res) => {
  try {
    const query = req.user?.role === 'client' ? { clientId: req.user.clientId } : {};
    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Erro no GET /transactions:', err);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// POST /api/crm/transactions - Criar lançamento financeiro
router.post('/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const saved = await newTransaction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// DELETE /api/crm/transaction/:id - Deletar lançamento
router.delete('/transaction/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Transação removida com sucesso' });
    } else {
      res.status(404).json({ error: 'Transação não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover transação' });
  }
});

// --- CAMPAIGNS ROUTES ---

// GET /api/crm/campaigns - Listar campanhas
router.get('/campaigns', async (req, res) => {
  try {
    const query = req.user?.role === 'client' ? { clientId: req.user.clientId } : {};
    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar campanhas' });
  }
});

// POST /api/crm/campaigns - Criar campanha
router.post('/campaigns', async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body);
    const saved = await newCampaign.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar campanha' });
  }
});

// PUT /api/crm/campaign/:id - Atualizar campanha
router.put('/campaign/:id', async (req, res) => {
  try {
    const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedCampaign) {
      res.json(updatedCampaign);
    } else {
      res.status(404).json({ error: 'Campanha não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar campanha' });
  }
});

// DELETE /api/crm/campaign/:id - Deletar campanha
router.delete('/campaign/:id', async (req, res) => {
  try {
    const deleted = await Campaign.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Campanha removida com sucesso' });
    } else {
      res.status(404).json({ error: 'Campanha não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover campanha' });
  }
});

export default router;
