import express from 'express';
import { Task } from '../models/Task';

const router = express.Router();

// GET /api/tasks
// Retorna todas as tarefas (opcional: filtrar por clientId)
router.get('/', async (req, res) => {
  try {
    const query = req.query.clientId ? { clientId: req.query.clientId as string } : {};
    
    // Opcionalmente, garantir que 'client' só veja suas tarefas se usarmos para clientes depois,
    // mas por enquanto, assumimos que isso é para uso interno da agência.
    const tasks = await Task.find(query).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// PATCH /api/tasks/:id/status
// Rota dedicada para atualização rápida de status no Drag & Drop
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in_progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status da tarefa' });
  }
});

// PUT /api/tasks/:id
// Rota completa para edição de outros campos
router.put('/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json({ message: 'Tarefa removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover tarefa' });
  }
});

export default router;
