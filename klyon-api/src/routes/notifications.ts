import express from 'express';
import { Notification } from '../models/Notification';

const router = express.Router();

// GET /api/notifications — Retorna as últimas 30 notificações
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// GET /api/notifications/unread-count — Retorna apenas a contagem de não-lidas (leve)
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao contar notificações' });
  }
});

// PATCH /api/notifications/read-all — Marca todas como lidas
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
  }
});

// DELETE /api/notifications/:id — Remove uma notificação individual
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Notificação removida' });
    } else {
      res.status(404).json({ error: 'Notificação não encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover notificação' });
  }
});

export default router;
