import express from 'express';
import { engine } from '../worker/AutomationEngine';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/whatsapp/status - Verifica se o WhatsApp está pronto (Com a Cloud API, se tem Token, está pronto)
router.get('/status', (req, res) => {
  const ready = engine.isWhatsappReady();
  
  res.json({
    ready,
    qrAvailable: false // Nunca mais teremos QR Code
  });
});

// GET /api/whatsapp/qr - Apenas para retrocompatibilidade do front-end não quebrar
router.get('/qr', (req, res) => {
  res.status(404).json({ error: 'Cloud API does not use QR Codes.' });
});

// POST /api/whatsapp/connect - Simula conexão
router.post('/connect', protect, (req, res) => {
  engine.mockConnected = true;
  res.json({ success: true, ready: true });
});

// POST /api/whatsapp/disconnect - Simula desconexão
router.post('/disconnect', protect, (req, res) => {
  engine.mockConnected = false;
  res.json({ success: true, ready: false });
});

// --- ROTAS DA CAIXA DE ENTRADA (INBOX) ---

// GET /api/whatsapp/chats - Listar conversas (agora puxadas do MongoDB)
router.get('/chats', protect, async (req, res) => {
  try {
    const chats = await engine.getActiveChats();
    res.json(chats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/whatsapp/chats/:id/messages - Listar mensagens de uma conversa
router.get('/chats/:id/messages', protect, async (req, res) => {
  try {
    const messages = await engine.getChatMessages(req.params.id as string, 50);
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/whatsapp/chats/:id/send - Enviar mensagem manualmente
router.post('/chats/:id/send', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    // O ID recebido do frontend na rota antiga vinha como '551199999999@c.us'
    // Precisamos limpar o '@c.us' para a Meta Cloud API
    const rawId = req.params.id as string;
    const phone = rawId.replace('@c.us', '');

    const message = await engine.sendManualMessage(phone, text);
    res.json(message);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
