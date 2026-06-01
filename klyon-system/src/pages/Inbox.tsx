import React, { useState, useEffect, useRef } from 'react';
import { whatsappApi, quickRepliesApi, clientsApi } from '../api';
import { Send, Search, RefreshCw, AlertCircle, CheckCheck, MessageCircle, Settings, Plus, X, Zap, Trash2, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import clsx from 'clsx';
import type { WhatsappChat, WhatsappMessage, QuickReply, Client } from '../types';
import { initialQuickReplies } from '../mockData';

export function Inbox() {
  const [chats, setChats] = useState<WhatsappChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  
  // Quick Replies State
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [qrFilter, setQrFilter] = useState('');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [agencyClient, setAgencyClient] = useState<Client | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'robo' | 'atalhos' | 'ai'>('robo');
  const [newShortcut, setNewShortcut] = useState('');
  const [newContent, setNewContent] = useState('');
  const [savingQuickReply, setSavingQuickReply] = useState(false);
  const [quickReplyError, setQuickReplyError] = useState<string | null>(null);
  
  // UI State
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleAddQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcut.trim() || !newContent.trim()) return;
    
    // Auto-remove leading slash if they typed it
    let cleanShortcut = newShortcut.trim();
    if (cleanShortcut.startsWith('/')) {
      cleanShortcut = cleanShortcut.substring(1);
    }
    
    try {
      setSavingQuickReply(true);
      setQuickReplyError(null);
      
      const created = await quickRepliesApi.create({
        shortcut: cleanShortcut,
        content: newContent.trim(),
        clientId: agencyClient?.id
      });
      
      setQuickReplies(prev => {
        const filtered = prev.filter(qr => qr.shortcut !== cleanShortcut); // prevent local duplicates in view
        return [...filtered, created].sort((a, b) => a.shortcut.localeCompare(b.shortcut));
      });
      
      setNewShortcut('');
      setNewContent('');
    } catch (err: any) {
      setQuickReplyError(err.message || 'Erro ao criar atalho');
    } finally {
      setSavingQuickReply(false);
    }
  };

  const handleDeleteQuickReply = async (id: string) => {
    if (!confirm('Deseja realmente remover este atalho?')) return;
    try {
      await quickRepliesApi.delete(id);
      setQuickReplies(prev => prev.filter(qr => qr._id !== id));
    } catch (err) {
      alert('Erro ao excluir atalho. Certifique-se de que não é um atalho padrão.');
    }
  };

  // Inicialização
  useEffect(() => {
    fetchChats(false);
    fetchConfigAndReplies();
    const interval = setInterval(() => fetchChats(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConfigAndReplies = async () => {
    try {
      // Pega o primeiro cliente do CRM para usar como "A Agência"
      const clients = await clientsApi.getAll();
      if (clients && clients.length > 0) {
        setAgencyClient(clients[0]);
      }
      
      const qrs = await quickRepliesApi.getAll();
      setQuickReplies(qrs.length > 0 ? qrs : initialQuickReplies);
    } catch (err) {
      console.warn("Usando mock para quick replies");
      setQuickReplies(initialQuickReplies);
    }
  };

  const fetchChats = async (isPolling = false) => {
    try {
      if (!isPolling) setLoadingChats(true);
      const data = await whatsappApi.getChats();
      const newChats = data.filter((c: any) => !c.isGroup);
      setChats(prev => JSON.stringify(prev) === JSON.stringify(newChats) ? prev : newChats);
      setError(null);
    } catch (err: any) {
      if (!isPolling) setError('Falha ao conectar ao WhatsApp. Verifique se o QR Code foi lido.');
    } finally {
      if (!isPolling) setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string, isPolling = false) => {
    try {
      if (!isPolling) setLoadingMessages(true);
      const data = await whatsappApi.getMessages(chatId);
      setMessages(prev => {
        if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
          return prev;
        }
        return data;
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId, false);
      const interval = setInterval(() => fetchMessages(activeChatId, true), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Envio e Atalhos
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Detectar barra "/" para Quick Replies
    const match = val.match(/\/(.*)$/);
    if (match) {
      setShowQuickReplies(true);
      setQrFilter(match[1].toLowerCase());
    } else {
      setShowQuickReplies(false);
    }
  };

  const insertQuickReply = (content: string) => {
    // Substitui tudo depois da última "/" pelo atalho
    const newVal = inputText.replace(/\/[^/]*$/, content);
    setInputText(newVal);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeChatId) return;
    try {
      setSending(true);
      const newMsg = await whatsappApi.sendMessage(activeChatId, inputText);
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
      setShowQuickReplies(false);
    } catch (err) {
      alert('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showQuickReplies) {
        // Pega o primeiro atalho filtrado se pressionar Enter
        const filtered = quickReplies.filter(qr => qr.shortcut.toLowerCase().includes(qrFilter));
        if (filtered.length > 0) {
          e.preventDefault();
          insertQuickReply(filtered[0].content);
          return;
        }
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveSettings = async () => {
    if (agencyClient) {
      try {
        await clientsApi.update(agencyClient.id, agencyClient);
      } catch (e) {
        console.warn("Salvou mock config");
      }
    }
    setShowSettings(false);
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Inbox Turbo <Zap className="text-yellow-400" size={24} />
          </h1>
          <p className="text-gray-400 mt-1">Converse com leads e gerencie o Robô de Auto-Responder.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors border border-white/10"
          >
            <Settings size={18} />
            Configurar Robô
          </button>
          <button 
            onClick={() => fetchChats()}
            className="flex items-center gap-2 px-4 py-2 bg-neon-indigo hover:bg-indigo-600 rounded-lg text-white font-medium transition-colors"
          >
            <RefreshCw size={18} className={loadingChats ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
          <AlertCircle size={24} className="shrink-0" />
          <p>O WhatsApp ainda está sincronizando suas mensagens (isso pode levar alguns minutos na primeira vez) ou ocorreu um erro de conexão.</p>
        </div>
      )}
      
      <div className="flex h-[calc(100vh-200px)] gap-6">
        {/* Lista de Chats */}
        <GlassCard className="w-1/3 flex flex-col p-0 overflow-hidden border-white/[0.08]">
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar conversa..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-indigo/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingChats && chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Carregando conversas...</div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Nenhuma conversa encontrada.</div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={clsx(
                      "p-4 border-b border-white/[0.05] cursor-pointer transition-colors hover:bg-white/[0.03]",
                      activeChatId === chat.id ? "bg-white/[0.05] border-l-4 border-l-neon-indigo" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">
                          {chat.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-white font-medium truncate text-sm">{chat.name}</h3>
                        </div>
                        <p className="text-gray-400 text-xs truncate">{chat.lastMessage || 'Envie uma mensagem...'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Área do Chat */}
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-white/[0.08] relative">
            {activeChatId ? (
              <>
                <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {activeChat?.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">{activeChat?.name}</h2>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                      Online
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/10">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={clsx("flex", msg.fromMe ? "justify-end" : "justify-start")}>
                      <div className={clsx(
                        "max-w-[70%] rounded-2xl px-4 py-2.5 shadow-lg",
                        msg.fromMe ? "bg-neon-indigo text-white rounded-tr-sm" : "bg-white/10 text-white rounded-tl-sm border border-white/5"
                      )}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                        <div className={clsx("text-[10px] mt-1 flex items-center gap-1", msg.fromMe ? "text-indigo-200 justify-end" : "text-gray-400")}>
                          {new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.fromMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies Menu Overlay */}
                {showQuickReplies && (
                  <div className="absolute bottom-[90px] left-4 bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl p-2 w-80 max-h-60 overflow-y-auto z-10 animate-fade-in">
                    <p className="text-xs text-gray-500 mb-2 px-2 uppercase font-bold">Atalhos (Pressione Enter)</p>
                    {quickReplies
                      .filter(qr => qr.shortcut.toLowerCase().includes(qrFilter))
                      .map((qr) => (
                        <div 
                          key={qr._id}
                          onClick={() => insertQuickReply(qr.content)}
                          className="px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="text-neon-indigo font-bold text-sm mb-1">/{qr.shortcut}</div>
                          <div className="text-gray-400 text-xs truncate">{qr.content}</div>
                        </div>
                      ))}
                    {quickReplies.filter(qr => qr.shortcut.toLowerCase().includes(qrFilter)).length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-500">Nenhum atalho encontrado para "/{qrFilter}"</div>
                    )}
                  </div>
                )}

                <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
                  <div className="flex gap-2 items-end">
                    <textarea 
                      ref={inputRef}
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite uma mensagem ou / para atalhos..."
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-indigo/50 transition-colors resize-none custom-scrollbar"
                      rows={2}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!inputText.trim() || sending}
                      className="h-[46px] px-6 bg-neon-indigo hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-neon-indigo/20"
                    >
                      {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageCircle size={32} className="text-gray-400 mb-4" />
                <p>Selecione uma conversa à esquerda.</p>
              </div>
            )}
          </GlassCard>
        </div>

      {/* Modal de Configurações (Auto-Responder & Atalhos) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-lg p-6 animate-fade-in border-neon-indigo/30 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-neon-indigo" /> 
                Configurações do Inbox
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-white/10 mb-5 shrink-0">
              <button 
                onClick={() => setActiveSettingsTab('robo')}
                className={clsx(
                  "pb-2.5 px-4 font-semibold text-xs uppercase tracking-wider transition-all relative cursor-pointer",
                  activeSettingsTab === 'robo' ? "text-neon-indigo" : "text-gray-400 hover:text-white"
                )}
              >
                Robô Auto-Responder
                {activeSettingsTab === 'robo' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-indigo shadow-[0_0_8px_#6366f1]"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveSettingsTab('atalhos')}
                className={clsx(
                  "pb-2.5 px-4 font-semibold text-xs uppercase tracking-wider transition-all relative cursor-pointer",
                  activeSettingsTab === 'atalhos' ? "text-neon-indigo" : "text-gray-400 hover:text-white"
                )}
              >
                Respostas Rápidas
                {activeSettingsTab === 'atalhos' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-indigo shadow-[0_0_8px_#6366f1]"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveSettingsTab('ai')}
                className={clsx(
                  "pb-2.5 px-4 font-semibold text-xs uppercase tracking-wider transition-all relative cursor-pointer",
                  activeSettingsTab === 'ai' ? "text-neon-pink" : "text-gray-400 hover:text-white"
                )}
              >
                Inteligência Artificial
                {activeSettingsTab === 'ai' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-pink shadow-[0_0_8px_#ec4899]"></div>
                )}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1">
              {activeSettingsTab === 'robo' ? (
                <>
                  {/* Auto Responder Toggle */}
                  <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium flex items-center gap-2">
                          Robô Auto-Responder <Zap size={14} className="text-yellow-400"/>
                        </h4>
                        <p className="text-xs text-gray-400">Responde automaticamente (Cooldown: 1 hora/cliente)</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={agencyClient?.autoResponderEnabled || false}
                          onChange={(e) => setAgencyClient(prev => prev ? {...prev, autoResponderEnabled: e.target.checked} : null)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-indigo"></div>
                      </label>
                    </div>
                    
                    {agencyClient?.autoResponderEnabled && (
                      <div className="mt-4 animate-fade-in">
                        <label className="block text-xs font-medium text-gray-400 mb-2">Mensagem Automática</label>
                        <textarea 
                          value={agencyClient?.autoResponderMessage || ''}
                          onChange={(e) => setAgencyClient(prev => prev ? {...prev, autoResponderMessage: e.target.value} : null)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-indigo/50 outline-none resize-none"
                          rows={4}
                          placeholder="Ex: Olá! Nosso horário de atendimento encerrou..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 shrink-0">
                    <button 
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-neon-indigo hover:bg-indigo-600 rounded-lg text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-neon-indigo/20 cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </>
              ) : activeSettingsTab === 'ai' ? (
                <>
                  <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium flex items-center gap-2">
                          Assistente IA (Gemini) <Sparkles size={14} className="text-pink-400"/>
                        </h4>
                        <p className="text-xs text-gray-400">Qualifica leads automaticamente antes do humano.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={agencyClient?.aiEnabled || false}
                          onChange={(e) => setAgencyClient(prev => prev ? {...prev, aiEnabled: e.target.checked} : null)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-pink"></div>
                      </label>
                    </div>
                    
                    {agencyClient?.aiEnabled && (
                      <div className="mt-4 animate-fade-in">
                        <label className="block text-xs font-medium text-gray-400 mb-2">Comportamento da IA (Prompt)</label>
                        <textarea 
                          value={agencyClient?.aiPrompt || ''}
                          onChange={(e) => setAgencyClient(prev => prev ? {...prev, aiPrompt: e.target.value} : null)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-pink/50 outline-none resize-none"
                          rows={6}
                          placeholder="Ex: Você é um assistente da agência Klyon. Descubra o faturamento do lead..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 shrink-0">
                    <button 
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-neon-pink hover:bg-pink-600 rounded-lg text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-neon-pink/20 cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-5">
                  {/* Quick Replies CRUD Form */}
                  <form onSubmit={handleAddQuickReply} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4">
                    <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Criar Novo Atalho</h4>
                    
                    {quickReplyError && (
                      <p className="text-xs text-rose-400 font-medium">{quickReplyError}</p>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Atalho</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neon-indigo font-bold text-xs">/</span>
                          <input 
                            type="text"
                            required
                            placeholder="pix"
                            value={newShortcut}
                            onChange={(e) => setNewShortcut(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                            className="w-full bg-black/30 border border-white/10 rounded-lg pl-6 pr-2 py-2 text-xs text-white focus:border-neon-indigo/50 outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Mensagem Completa</label>
                        <input 
                          type="text"
                          required
                          placeholder="Olá! Segue nossa chave Pix..."
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-neon-indigo/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={savingQuickReply || !newShortcut.trim() || !newContent.trim()}
                        className="px-4 py-2 bg-neon-indigo hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {savingQuickReply ? 'Adicionando...' : 'Adicionar Atalho'}
                      </button>
                    </div>
                  </form>

                  {/* Quick Replies List */}
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">Seus Atalhos Cadastrados</h4>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl divide-y divide-white/5 bg-black/10">
                      {quickReplies.map((qr) => (
                        <div key={qr._id || qr.shortcut} className="p-3 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                          <div className="min-w-0 pr-4">
                            <span className="text-neon-indigo font-bold text-xs block">/{qr.shortcut}</span>
                            <span className="text-gray-400 text-xs block truncate mt-0.5" title={qr.content}>{qr.content}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteQuickReply(qr._id || '')}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Excluir Atalho"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {quickReplies.length === 0 && (
                        <div className="p-6 text-center text-gray-500 text-xs">Nenhum atalho cadastrado.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
