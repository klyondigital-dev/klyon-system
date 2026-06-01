import express from 'express';
import AutomationFlow from '../models/Automation';

const router = express.Router();

// GET all automations (optionally filter by clientId)
router.get('/', async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.clientId) filter.clientId = req.query.clientId;

    const flows = await AutomationFlow.find(filter).sort({ createdAt: -1 });
    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar automações' });
  }
});

// POST save a new automation
router.post('/', async (req, res) => {
  try {
    const newFlow = new AutomationFlow(req.body);
    const saved = await newFlow.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar automação' });
  }
});

// PUT update an automation
router.put('/:id', async (req, res) => {
  try {
    const updated = await AutomationFlow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar automação' });
  }
});

export default router;
