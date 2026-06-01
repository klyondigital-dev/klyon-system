import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import clsx from 'clsx';
import type { Appointment, Client } from '../types';
import { appointmentsApi } from '../api';
import { initialAppointments } from '../mockData';

interface CalendarPageProps {
  clients: Client[];
  selectedClientId: string;
}

export function CalendarPage({ clients, selectedClientId }: CalendarPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Appointment>>({
    title: '',
    date: new Date().toISOString().substring(0, 16),
    duration: 30,
    clientId: selectedClientId === 'all' ? '' : selectedClientId,
    status: 'scheduled'
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAll(selectedClientId);
      setAppointments(data);
    } catch (err) {
      console.warn('Usando mock data para agendamentos');
      setAppointments(initialAppointments.filter(a => selectedClientId === 'all' || a.clientId === selectedClientId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedClientId]);

  // Funções do Calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = new Date(year, month, 1).getDay(); // 0-6
    return { daysInMonth, startingDay };
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Preencher grid do calendário
  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-4 bg-white/[0.01] border border-white/[0.02]"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = 
      d === new Date().getDate() && 
      currentDate.getMonth() === new Date().getMonth() && 
      currentDate.getFullYear() === new Date().getFullYear();

    // Buscar eventos deste dia
    const dayEvents = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getDate() === d && 
             appDate.getMonth() === currentDate.getMonth() && 
             appDate.getFullYear() === currentDate.getFullYear();
    });

    days.push(
      <div 
        key={`day-${d}`} 
        className={clsx(
          "min-h-[100px] p-2 border border-white/[0.05] bg-black/20 hover:bg-white/[0.05] transition-colors relative group",
          isToday ? "ring-1 ring-neon-indigo/50 bg-indigo-900/20" : ""
        )}
      >
        <div className={clsx("text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1", isToday ? "bg-neon-indigo text-white" : "text-gray-400")}>
          {d}
        </div>
        
        <div className="space-y-1">
          {dayEvents.map(event => (
            <div 
              key={event._id} 
              className={clsx(
                "text-[10px] px-2 py-1 rounded-sm truncate flex items-center gap-1",
                event.status === 'scheduled' ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                event.status === 'completed' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              )}
              title={event.title}
            >
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full shrink-0",
                event.status === 'scheduled' ? "bg-indigo-400" :
                event.status === 'completed' ? "bg-emerald-400" : "bg-rose-400"
              )} />
              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.title}
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => {
            const defaultDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d, 10, 0);
            setNewEvent({ ...newEvent, date: new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) });
            setIsModalOpen(true);
          }}
          className="absolute bottom-2 right-2 p-1 rounded bg-neon-indigo/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus size={14} />
        </button>
      </div>
    );
  }

  const handleSaveAppointment = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.clientId) return;
    
    try {
      const saved = await appointmentsApi.create(newEvent);
      setAppointments([...appointments, saved]);
    } catch (err) {
      // Mock save
      setAppointments([...appointments, { ...newEvent, _id: `app-${Date.now()}` } as Appointment]);
    } finally {
      setIsModalOpen(false);
      setNewEvent({
        title: '',
        date: new Date().toISOString().substring(0, 16),
        duration: 30,
        clientId: selectedClientId === 'all' ? '' : selectedClientId,
        status: 'scheduled'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Agenda Automática</h1>
          <p className="text-gray-400 mt-1">Gerencie compromissos e deixe a IA marcar reuniões para você.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-indigo hover:bg-indigo-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-neon-indigo/20"
        >
          <Plus size={18} />
          Novo Agendamento
        </button>
      </div>

      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-neon-indigo" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())} 
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors text-sm"
            >
              Hoje
            </button>
            <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-gray-400 bg-white/[0.03] uppercase tracking-wider">
              {day}
            </div>
          ))}
          {days}
        </div>
      </GlassCard>

      {/* MODAL DE AGENDAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 animate-fade-in border-neon-indigo/30">
            <h3 className="text-xl font-bold text-white mb-6">Novo Agendamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Título do Evento</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-indigo"
                  placeholder="Ex: Apresentação Comercial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data e Hora</label>
                  <input 
                    type="datetime-local" 
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-indigo [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duração (min)</label>
                  <input 
                    type="number" 
                    value={newEvent.duration}
                    onChange={e => setNewEvent({...newEvent, duration: parseInt(e.target.value)})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-indigo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cliente Vinculado</label>
                <select 
                  value={newEvent.clientId}
                  onChange={e => setNewEvent({...newEvent, clientId: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-indigo"
                >
                  <option value="" disabled>Selecione um cliente...</option>
                  {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.company}
                  </option>
                ))}</select>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveAppointment}
                  disabled={!newEvent.title || !newEvent.clientId || !newEvent.date}
                  className="px-6 py-2 bg-neon-indigo hover:bg-indigo-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-neon-indigo/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
