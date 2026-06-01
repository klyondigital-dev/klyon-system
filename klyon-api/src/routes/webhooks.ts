import express from 'express';
import crypto from 'crypto';
import Lead from '../models/Lead';
import WebhookLink from '../models/WebhookLink';
import { Notification } from '../models/Notification';
import { engine } from '../worker/AutomationEngine';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/webhooks/meta (Verificação exigida pela Meta na configuração)
router.get('/meta', (req, res) => {
  const verify_token = process.env.META_WA_VERIFY_TOKEN; // Usando o novo token único

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('✅ META WEBHOOK VERIFICADO COM SUCESSO');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// POST /api/webhooks/meta (Recebimento de Leads e Mensagens WhatsApp)
router.post('/meta', async (req, res) => {
  let body = req.body;

  // Tratar Leads do Facebook (Leadgen)
  if (body.object === 'page') {
    try {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            const leadData = change.value;
            console.log('📩 Novo Lead Recebido via Meta Ads:', leadData.leadgen_id);
            
            const newLead = new Lead({
              name: 'Lead do Facebook (ID: ' + leadData.leadgen_id + ')',
              email: 'lead_' + leadData.leadgen_id + '@meta.com',
              phone: '11999999999', // Simulado
              source: 'Meta Ads',
              status: 'new'
            });
            const saved = await newLead.save();
            console.log('✅ Lead Salvo no MongoDB');
            
            try {
              await Notification.create({
                type: 'new_lead',
                title: `Novo lead via Meta Ads`,
                description: `Lead ID: ${leadData.leadgen_id}`,
              });
            } catch (notifErr) {}

            engine.triggerFlows('Meta Ads (Lead Form)', saved);
          }
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('Erro ao processar Webhook do Meta Ads:', err);
      res.sendStatus(500);
    }
  } 
  // Tratar Mensagens do WhatsApp Cloud API
  else if (body.object === 'whatsapp_business_account') {
    try {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages && change.value.messages[0]) {
            const message = change.value.messages[0];
            const contact = change.value.contacts ? change.value.contacts[0] : null;
            
            const phone = message.from;
            const text = message.text ? message.text.body : '[Mídia/Outro]';
            const contactName = contact && contact.profile ? contact.profile.name : phone;

            await engine.handleIncomingMetaMessage(phone, text, contactName);
          }
        }
      }
      res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('Erro ao processar Webhook do WhatsApp:', err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});

// --- CUSTOM WEBHOOKS MANAGEMENT API ---

// GET /api/webhooks/links - List all custom webhooks
router.get('/links', protect, async (req, res) => {
  try {
    const query = req.user?.role === 'client' ? { clientId: req.user.clientId } : {};
    const links = await WebhookLink.find(query).sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar webhooks' });
  }
});

// POST /api/webhooks/links - Generate a new webhook link
router.post('/links', protect, async (req, res) => {
  try {
    const urlId = crypto.randomUUID().replace(/-/g, '').substring(0, 16); // e.g. 8a7b6c5d4e3f2a1b
    const clientId = req.user?.role === 'client' ? req.user.clientId : req.body.clientId;

    const newLink = new WebhookLink({
      ...req.body,
      urlId,
      clientId
    });
    
    const saved = await newLink.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar webhook' });
  }
});

// DELETE /api/webhooks/links/:id - Delete a webhook link
router.delete('/links/:id', protect, async (req, res) => {
  try {
    const deleted = await WebhookLink.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Webhook removido' });
    } else {
      res.status(404).json({ error: 'Webhook não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover webhook' });
  }
});

// --- CUSTOM WEBHOOK RECEIVER ---

// POST /api/webhooks/custom/:urlId - Receive leads from Elementor, Typeform, etc.
router.post('/custom/:urlId', async (req, res) => {
  try {
    const { urlId } = req.params;
    const body = req.body;

    const link = await WebhookLink.findOne({ urlId, status: 'active' });
    
    if (!link) {
      return res.status(404).json({ error: 'Webhook não encontrado ou inativo.' });
    }

    // Attempt to extract common fields dynamically from the payload
    // Elementor usually sends an array of fields or an object map. Typeform is deeper.
    // We will do a generic extraction looking for 'name', 'email', 'phone' in keys or values.
    let extractedName = body.name || body.nome || body.fullName || body['first_name'] || 'Lead Customizado';
    let extractedEmail = body.email || body.mail || body['e-mail'] || 'sem-email@klyon.com';
    let extractedPhone = body.phone || body.telefone || body.whatsapp || body.celular || body.tel || '';

    // If body has a "fields" array (Elementor logic)
    if (body.fields && Array.isArray(body.fields)) {
      body.fields.forEach((field: any) => {
        const id = String(field.id || '').toLowerCase();
        const value = String(field.value || '');
        if (id.includes('name') || id.includes('nome')) extractedName = value;
        if (id.includes('email') || id.includes('mail')) extractedEmail = value;
        if (id.includes('phone') || id.includes('telefone') || id.includes('whatsapp')) extractedPhone = value;
      });
    }

    const newLead = new Lead({
      clientId: link.clientId,
      name: extractedName,
      email: extractedEmail,
      phone: extractedPhone,
      source: link.source || 'Webhook',
      status: 'new'
    });

    const savedLead = await newLead.save();

    // Increment counter
    link.leadsCount += 1;
    await link.save();

    // 🔔 Criar notificação de novo lead customizado
    try {
      await Notification.create({
        type: 'new_lead',
        title: `Novo lead: ${extractedName}`,
        description: `Via webhook: ${link.name || 'Customizado'}`,
      });
    } catch (notifErr) {
      console.error('Erro ao criar notificação de lead:', notifErr);
    }

    // Trigger Automations
    engine.triggerFlows('API / Webhook Customizado', savedLead);

    res.status(200).json({ success: true, leadId: savedLead._id });
  } catch (err) {
    console.error('Erro ao processar Webhook Customizado:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
