import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, MessageCircle, UserPlus, Bot, Info, X, CheckCheck, Trash2 } from 'lucide-react';
import { notificationsApi } from '../api';
import type { AppNotification } from '../types';
import clsx from 'clsx';

// Helper: Gera um beep suave usando Web Audio API
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Primeiro tom (mais alto)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.15);

    // Segundo tom (harmonia)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.08); // E6
    gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.08);
    osc2.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Audio não disponível — sem problemas
  }
};

// Helper: Tempo relativo em pt-BR
const timeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
};

const ICON_MAP = {
  whatsapp_message: { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  new_lead: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  auto_responder: { icon: Bot, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  system: { icon: Info, color: 'text-gray-400', bg: 'bg-white/[0.04]', border: 'border-white/[0.06]' },
};

const POLL_INTERVAL = 8000; // 8 segundos

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastKnownCountRef = useRef(0);
  const hasInteractedRef = useRef(false); // Para habilitar som somente após interação do usuário

  // Listener de interação para liberar Audio API
  useEffect(() => {
    const handler = () => { hasInteractedRef.current = true; };
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    };
  }, []);

  // Polling inteligente para contagem de não-lidas
  const pollUnreadCount = useCallback(async () => {
    if (document.hidden) return; // Otimização: Não faz polling se a aba estiver em segundo plano

    try {
      const count = await notificationsApi.getUnreadCount();
      
      // Se o count aumentou, toca som
      if (count > lastKnownCountRef.current && lastKnownCountRef.current >= 0 && hasInteractedRef.current) {
        playNotificationSound();
      }
      
      lastKnownCountRef.current = count;
      setUnreadCount(count);
    } catch (e) {
      // Silenciosa — API pode estar fora
    }
  }, []);

  useEffect(() => {
    // Primeiro fetch imediato
    pollUnreadCount();
    
    const interval = setInterval(pollUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pollUnreadCount]);

  // Carrega todas notificações quando abre o dropdown
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (e) {
      console.error('Erro ao buscar notificações:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      lastKnownCountRef.current = 0;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error('Erro ao marcar notificações:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Se a notificação deletada era não-lida, decrementa o count
      const deleted = notifications.find(n => n._id === id);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        lastKnownCountRef.current = Math.max(0, lastKnownCountRef.current - 1);
      }
    } catch (e) {
      console.error('Erro ao remover notificação:', e);
    }
  };

  return (
    <div className="relative">
      {/* Botão do Sino */}
      <button
        onClick={handleOpen}
        className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-gray-400 hover:text-white transition-colors cursor-pointer relative group"
        id="notification-bell"
      >
        <Bell size={16} className={clsx(
          "transition-all",
          unreadCount > 0 && "animate-[wiggle_0.5s_ease-in-out]"
        )} />
        
        {/* Badge animado */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-neon-pink to-rose-500 text-[10px] font-bold text-white shadow-glow-pink animate-pulse border-2 border-primary">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 max-h-[480px] rounded-2xl bg-surface/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">Notificações</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-neon-pink/15 text-neon-pink border border-neon-pink/20 px-1.5 py-0.5 rounded-md">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-neon-cyan font-bold cursor-pointer hover:text-white transition-colors"
                  >
                    <CheckCheck size={12} />
                    Marcar como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-neon-indigo border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                    <Bell size={20} className="text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Nenhuma notificação</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Novas atividades aparecerão aqui</p>
                </div>
              ) : (
                <div className="py-1.5">
                  {notifications.map((notif) => {
                    const iconConfig = ICON_MAP[notif.type] || ICON_MAP.system;
                    const Icon = iconConfig.icon;
                    
                    return (
                      <div
                        key={notif._id}
                        className={clsx(
                          "flex items-start gap-3 px-5 py-3 transition-colors group relative",
                          !notif.read
                            ? "bg-neon-indigo/[0.03] hover:bg-neon-indigo/[0.06]"
                            : "hover:bg-white/[0.02]"
                        )}
                      >
                        {/* Indicator dot para não-lida */}
                        {!notif.read && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-glow-cyan" />
                        )}

                        {/* Icon */}
                        <div className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                          iconConfig.bg, iconConfig.border
                        )}>
                          <Icon size={14} className={iconConfig.color} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={clsx(
                            "text-xs leading-snug",
                            !notif.read ? "text-white font-semibold" : "text-gray-300 font-medium"
                          )}>
                            {notif.title}
                          </p>
                          {notif.description && (
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                              {notif.description}
                            </p>
                          )}
                          <span className="text-[10px] text-gray-600 mt-1 block">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>

                        {/* Delete button (on hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all cursor-pointer flex-shrink-0 mt-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/[0.04] px-5 py-2.5 flex-shrink-0">
                <p className="text-[10px] text-gray-600 text-center">
                  Mostrando as últimas {notifications.length} notificações
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
