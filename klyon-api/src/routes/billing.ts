import express from 'express';
import Invoice from '../models/Invoice';
import Client from '../models/Client';
import axios from 'axios';

const router = express.Router();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

// 1. GET /api/billing
// Lista todas as faturas
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching invoices', error: error.message });
  }
});

// 2. POST /api/billing
// Cria uma nova cobrança (Integração Asaas)
router.post('/', async (req, res) => {
  try {
    const { clientId, amount, dueDate, description } = req.body;

    if (!clientId || !amount || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let clientDb = await Client.findById(clientId);
    if (!clientDb) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    let asaasId = '';
    let invoiceUrl = '';
    let pixEncodedImage = '';
    let pixPayload = '';

    // Se o Asaas estiver configurado no .env, fazemos a chamada real
    if (ASAAS_API_KEY) {
      
      // Criar cliente no Asaas caso não exista
      if (!clientDb.asaasCustomerId) {
        try {
          const customerPayload = {
            name: clientDb.name,
            email: clientDb.email,
            phone: clientDb.phone,
            cpfCnpj: '41164843056' // CPF válido matematicamente para teste no Sandbox
          };
          const custRes = await axios.post(`${ASAAS_API_URL}/customers`, customerPayload, {
            headers: { access_token: ASAAS_API_KEY }
          });
          clientDb.asaasCustomerId = custRes.data.id;
          await clientDb.save();
        } catch (custError: any) {
          console.error('Erro ao criar customer no Asaas:', custError.response?.data || custError.message);
          return res.status(500).json({ message: 'Erro ao criar cliente no gateway de pagamentos', error: custError.message });
        }
      }

      const payload = {
        customer: clientDb.asaasCustomerId,
        billingType: 'PIX',
        value: amount,
        dueDate: dueDate,
        description: description
      };

      // 1. Criar Cobrança
      const chargeRes = await axios.post(`${ASAAS_API_URL}/payments`, payload, {
        headers: { access_token: ASAAS_API_KEY }
      });
      
      asaasId = chargeRes.data.id;
      invoiceUrl = chargeRes.data.invoiceUrl;

      // 2. Buscar o QR Code do PIX gerado
      const pixRes = await axios.get(`${ASAAS_API_URL}/payments/${asaasId}/pixQrCode`, {
        headers: { access_token: ASAAS_API_KEY }
      });

      pixEncodedImage = pixRes.data.encodedImage;
      pixPayload = pixRes.data.payload;

    } else {
      // === MOCK PARA TESTE LOCAL CASO NÃO TENHA A CHAVE ===
      console.log('⚠️ ASAAS_API_KEY não configurada. Gerando fatura MOCK.');
      asaasId = 'pay_' + Math.floor(Math.random() * 1000000000);
      invoiceUrl = 'https://sandbox.asaas.com/i/' + asaasId;
      pixPayload = '00020101021226840014br.gov.bcb.pix2562asaas.com/pix/qr/' + asaasId + '520400005303986540510.005802BR5915KLYON MARKETING6009SAO PAULO62070503***63041F2A';
    }

    // Salvar no Banco de Dados do Klyon
    const invoice = new Invoice({
      clientId,
      amount,
      dueDate,
      description,
      status: 'PENDING',
      asaasId,
      invoiceUrl,
      pixEncodedImage,
      pixPayload
    });

    await invoice.save();

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Asaas Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
});

// 3. POST /api/billing/webhook
// Rota para receber atualizações automáticas do Asaas
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    if (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') {
      const paymentId = event.payment.id;
      
      // Atualizar status no banco
      await Invoice.findOneAndUpdate(
        { asaasId: paymentId },
        { status: 'RECEIVED' }
      );
      console.log(`✅ Fatura ${paymentId} paga com sucesso!`);
    } else if (event.event === 'PAYMENT_OVERDUE') {
      const paymentId = event.payment.id;
      await Invoice.findOneAndUpdate(
        { asaasId: paymentId },
        { status: 'OVERDUE' }
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Webhook Error');
  }
});

export default router;
