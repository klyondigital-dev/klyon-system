import express from 'express';
import { QuickReply } from '../models/QuickReply';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/quick-replies
router.get('/', protect, async (req: any, res: any) => {
  try {
    const query: any = {};
    // Se for client, forçar o clientId dele
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    } else if (req.query.clientId && req.query.clientId !== 'all') {
      query.clientId = req.query.clientId;
    }

    const replies = await QuickReply.find(query).sort({ shortcut: 1 });
    res.json(replies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quick-replies
router.post('/', protect, async (req: any, res: any) => {
  try {
    const data = { ...req.body };
    if (req.user.role === 'client') {
      data.clientId = req.user._id;
    }

    // Remover a barra se o usuário digitou
    if (data.shortcut && data.shortcut.startsWith('/')) {
      data.shortcut = data.shortcut.substring(1);
    }

    const quickReply = new QuickReply(data);
    const saved = await quickReply.save();
    res.status(201).json(saved);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Atalho já existe para este cliente.' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/quick-replies/:id
router.delete('/:id', protect, async (req: any, res: any) => {
  try {
    const reply = await QuickReply.findById(req.params.id);
    if (!reply) return res.status(404).json({ message: 'Atalho não encontrado' });

    if (req.user.role === 'client' && reply.clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    await reply.deleteOne();
    res.json({ message: 'Atalho removido' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
