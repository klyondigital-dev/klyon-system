import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Calendar, User, AlignLeft, Flag, Trash2, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { tasksApi } from '../api';
import type { AgencyTask, Client } from '../types';
import clsx from 'clsx';

interface TasksProps {
  clients: Client[];
  selectedClientId: string;
}

const COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'border-gray-500' },
  { id: 'in_progress', title: 'Em Progresso', color: 'border-blue-500' },
  { id: 'review', title: 'Em Revisão', color: 'border-amber-500' },
  { id: 'done', title: 'Concluído', color: 'border-emerald-500' }
];

export const Tasks: React.FC<TasksProps> = ({ clients, selectedClientId }) => {
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    clientId: selectedClientId === 'all' ? '' : selectedClientId
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksApi.getAll(selectedClientId);
      setTasks(data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedClientId]);

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    // Para Firefox suportar o drag
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Deixa o card semitransparente ao arrastar
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(null);
    const el = document.getElementById(`task-${taskId}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t._id === draggedTaskId);
    if (!task || task.status === targetStatus) return; // Nenhuma mudança necessária

    // Atualização otimista na UI
    setTasks(prev => prev.map(t => 
      t._id === draggedTaskId ? { ...t, status: targetStatus as any } : t
    ));

    try {
      // Persiste no backend
      await tasksApi.updateStatus(draggedTaskId, targetStatus);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      // Reverte em caso de erro
      fetchTasks();
    }
  };

  // --- Modal Handlers ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTask = await tasksApi.create({ ...formData, status: 'todo' });
      setTasks(prev => [newTask, ...prev]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'medium', clientId: selectedClientId === 'all' ? '' : selectedClientId });
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta tarefa?')) return;
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Erro ao remover tarefa:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getClientName = (id?: string) => {
    if (!id) return 'Agência Interna';
    return clients.find(c => c.id === id)?.company || 'Cliente Desconhecido';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-indigo border-t-transparent rounded-full animate-spin shadow-glow-indigo"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Quadro de Tarefas</h2>
          <p className="text-sm text-gray-400">Gerencie a produção e entregas da agência.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-indigo text-white font-semibold text-sm hover:bg-indigo-500 transition-colors shadow-glow-indigo"
        >
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);

          return (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-[320px] flex flex-col h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={clsx(
                "mb-4 px-4 py-3 rounded-xl bg-surface border-t-2 shadow-lg flex items-center justify-between",
                column.color
              )}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{column.title}</h3>
                <span className="w-6 h-6 rounded-md bg-white/[0.05] text-gray-400 text-xs font-bold flex items-center justify-center">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Body / Drop Zone */}
              <div className="flex-1 rounded-xl bg-black/20 border border-white/[0.02] p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                {columnTasks.map(task => (
                  <div
                    key={task._id}
                    id={`task-${task._id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onDragEnd={(e) => handleDragEnd(e, task._id)}
                    className="bg-surface rounded-xl p-4 border border-white/[0.05] shadow-lg cursor-grab active:cursor-grabbing hover:border-white/[0.1] transition-colors group relative"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className={clsx(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          getPriorityColor(task.priority)
                        )}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-white mb-1.5 leading-snug">{task.title}</h4>
                    
                    {task.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        <AlignLeft size={12} className="inline mr-1" />
                        {task.description}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-gray-500">
                      <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                        <User size={12} />
                        <span className="truncate">{getClientName(task.clientId)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{new Date(task.createdAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State Helper */}
                {columnTasks.length === 0 && (
                  <div className="h-full min-h-[100px] rounded-lg border-2 border-dashed border-white/[0.05] flex flex-col items-center justify-center text-gray-500 text-xs">
                    Arraste cards para cá
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-surface border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-white">Nova Tarefa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-indigo transition-colors"
                  placeholder="Ex: Criar Landing Page do zero"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descrição (Opcional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-indigo transition-colors resize-none"
                  placeholder="Detalhes adicionais da tarefa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-indigo transition-colors appearance-none"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cliente Relacionado</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-indigo transition-colors appearance-none"
                  >
                    <option value="">Agência Interna</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neon-indigo hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-glow-indigo"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
