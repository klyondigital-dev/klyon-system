import express from 'express';
import { Appointment } from '../models/Appointment';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/appointments
router.get('/', protect, async (req: any, res: any) => {
  try {
    const query: any = {};
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    } else if (req.query.clientId && req.query.clientId !== 'all') {
      query.clientId = req.query.clientId;
    }
    
    // Sort by date ascending
    const appointments = await Appointment.find(query).sort({ date: 1 });
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/appointments
router.post('/', protect, async (req: any, res: any) => {
  try {
    const appointmentData = { ...req.body };
    // Se for client, forçar o clientId dele
    if (req.user.role === 'client') {
      appointmentData.clientId = req.user._id;
    }
    
    const appointment = new Appointment(appointmentData);
    const saved = await appointment.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/appointments/:id
router.put('/:id', protect, async (req: any, res: any) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });

    // Permissão
    if (req.user.role === 'client' && appointment.clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    Object.assign(appointment, req.body);
    const updated = await appointment.save();
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', protect, async (req: any, res: any) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });

    if (req.user.role === 'client' && appointment.clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Agendamento removido' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
