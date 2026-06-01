import React, { useState, useEffect } from 'react';
import type { AutomationFlow, AutomationStep } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Cpu, Play, Pause, CheckCircle2, AlertCircle, Clock, Mail, MessageSquare, Webhook, Split, Plus, Trash2, Save, X, Settings2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { automationsApi, whatsappApi } from '../api';

// --- SORTABLE ITEM COMPONENT ---
interface SortableStepItemProps {
  id: string;
  step: AutomationStep;
  idx: number;
  totalSteps: number;
  isActiveStep: boolean;
  getStepColorClass: (type: string) => string;
  getStepIcon: (type: string) => React.ReactNode;
  setActiveStepId: (id: string) => void;
  removeBlock: (id: string) => void;
  moveBlock: (idx: number, direction: 'up' | 'down') => void;
}

const SortableStepItem = ({ id, step, idx, totalSteps, isActiveStep, getStepColorClass, getStepIcon, setActiveStepId, removeBlock, moveBlock }: SortableStepItemProps) => {
  const isLast = idx === totalSteps - 1;
  const isFirst = idx === 0;

  return (
    <div className="w-full relative flex flex-col items-center">
      <div 
        onClick={() => setActiveStepId(step.id)}
        className={clsx(
          "flex items-center justify-between gap-4 p-4 rounded-xl glass-panel w-full border cursor-pointer transition-all relative group shadow-lg",
          isActiveStep ? "border-neon-indigo bg-neon-indigo/5 ring-1 ring-neon-indigo shadow-glow-indigo" : "border-white/[0.08] hover:border-white/[0.2]"
        )}
      >
        <div className="flex items-center gap-3">
          {/* SORT BUTTONS */}
          <div className="flex flex-col gap-1 -ml-2">
            {!isFirst && idx !== 1 && ( // can't move trigger
              <button 
                onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'up'); }}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Mover para Cima"
              >
                <ChevronUp size={14} />
              </button>
            )}
            {!isFirst && !isLast && (
              <button 
                onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'down'); }}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Mover para Baixo"
              >
                <ChevronDown size={14} />
              </button>
            )}
          </div>

          <div className={clsx("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", getStepColorClass(step.type))}>
            {getStepIcon(step.type)}
          </div>
          <div>
            <span className="block text-xs font-semibold text-white">{step.title}</span>
            <span className="text-[10px] text-gray-500 block truncate mt-0.5">{step.desc}</span>
          </div>
        </div>
        
        {step.type !== 'trigger' && (
          <button 
            onClick={(e) => { e.stopPropagation(); removeBlock(step.id); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-500/10 text-rose-400 rounded-lg transition-opacity hover:bg-rose-500/20"
            title="Remover Bloco"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {!isLast && (
        <div className="flex flex-col items-center">
          <div className="w-[1px] h-5 bg-white/[0.2]"></div>
          <div className="w-[1px] h-5 bg-white/[0.2]"></div>
        </div>
      )}
    </div>
  );
};

interface AutomationsProps {
  automations: AutomationFlow[];
  setAutomations: React.Dispatch<React.SetStateAction<AutomationFlow[]>>;
}

export const Automations: React.FC<AutomationsProps> = ({ automations, setAutomations }) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(automations[0]?.id || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftFlow, setDraftFlow] = useState<AutomationFlow | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  
  // Estado de conexão do WhatsApp Web
  const [wpStatus, setWpStatus] = useState<{ ready: boolean; qrAvailable: boolean }>({ ready: false, qrAvailable: false });
  const [qrRefreshKey, setQrRefreshKey] = useState<number>(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const activeFlow = automations.find((f) => f.id === selectedFlowId) || automations[0];

  // Polling para checar conexão de WhatsApp com a API a cada 5s
  useEffect(() => {
    if (isEditing) return;

    const checkStatus = async () => {
      try {
        const status = await whatsappApi.getStatus();
        setWpStatus(status);
      } catch (err) {
        console.warn('API de WhatsApp offline.', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [isEditing]);

  useEffect(() => {
    if (wpStatus.qrAvailable && !wpStatus.ready) {
      whatsappApi.getQRBlobUrl().then(setQrCodeUrl).catch(console.error);
      
      // Auto-refresh the QR code every 15 seconds because it expires on the backend
      const interval = setInterval(() => {
        setQrRefreshKey(prev => prev + 1);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [wpStatus.qrAvailable, wpStatus.ready, qrRefreshKey]);

  const toggleAutomationStatus = async (flowId: string) => {
    const flow = automations.find((f) => f.id === flowId);
    if (!flow) return;
    const newStatus = flow.status === 'active' ? 'paused' : 'active';

    try {
      const updated = await automationsApi.save({ ...flow, status: newStatus });
      setAutomations((prev) =>
        prev.map((f) => (f.id === flowId ? updated : f))
      );
    } catch (err) {
      console.warn('API Offline ao alternar status. Atualizando localmente.', err);
      setAutomations((prev) =>
        prev.map((f) => {
          if (f.id !== flowId) return f;
          return { ...f, status: newStatus };
        })
      );
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Webhook size={16} className="text-neon-cyan" />;
      case 'whatsapp': return <MessageSquare size={16} className="text-emerald-400" />;
      case 'email': return <Mail size={16} className="text-neon-indigo" />;
      case 'delay': return <Clock size={16} className="text-amber-400" />;
      case 'condition': return <Split size={16} className="text-neon-pink" />;
      default: return <Cpu size={16} className="text-gray-400" />;
    }
  };

  const getStepColorClass = (type: string) => {
    switch (type) {
      case 'trigger': return 'border-neon-cyan/20 bg-neon-cyan/5 text-neon-cyan';
      case 'whatsapp': return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
      case 'email': return 'border-neon-indigo/20 bg-neon-indigo/5 text-neon-indigo';
      case 'delay': return 'border-amber-500/20 bg-amber-500/5 text-amber-400';
      case 'condition': return 'border-neon-pink/20 bg-neon-pink/5 text-neon-pink';
      default: return 'border-white/[0.04] bg-white/[0.02] text-gray-400';
    }
  };

  // --- BUILDER ACTIONS ---
  const startNewFlow = () => {
    const newFlow: AutomationFlow = {
      id: `flow_${Date.now()}`,
      name: 'Nova Automação',
      description: 'Descrição do novo fluxo',
      trigger: 'Manual',
      stepsCount: 1,
      activeLeads: 0,
      conversionRate: 0,
      status: 'paused',
      steps: [
        { id: `step_${Date.now()}`, type: 'trigger', title: 'Gatilho de Entrada', desc: 'Define como o lead entra' }
      ]
    };
    setDraftFlow(newFlow);
    setIsEditing(true);
    setActiveStepId(newFlow.steps[0].id);
  };

  const editExistingFlow = () => {
    if (activeFlow) {
      setDraftFlow(JSON.parse(JSON.stringify(activeFlow))); // deep copy
      setIsEditing(true);
      setActiveStepId(activeFlow.steps[0]?.id || null);
    }
  };

  const saveFlow = async () => {
    if (!draftFlow) return;
    
    try {
      const saved = await automationsApi.save({ ...draftFlow, stepsCount: draftFlow.steps.length });
      setAutomations(prev => {
        const exists = prev.find(f => f.id === saved.id);
        if (exists) {
          return prev.map(f => f.id === saved.id ? saved : f);
        }
        return [saved, ...prev];
      });
      setSelectedFlowId(saved.id);
    } catch (err) {
      console.warn('API Offline ao salvar fluxo. Atualizando localmente.', err);
      setAutomations(prev => {
        const exists = prev.find(f => f.id === draftFlow.id);
        if (exists) {
          return prev.map(f => f.id === draftFlow.id ? { ...draftFlow, stepsCount: draftFlow.steps.length } : f);
        }
        return [{ ...draftFlow, stepsCount: draftFlow.steps.length }, ...prev];
      });
      setSelectedFlowId(draftFlow.id);
    }
    
    setIsEditing(false);
    setDraftFlow(null);
  };

  const moveBlock = (idx: number, direction: 'up' | 'down') => {
    if (!draftFlow) return;
    const newSteps = [...draftFlow.steps];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    // Cannot move trigger
    if (idx === 0 || targetIdx === 0) return;
    if (targetIdx >= newSteps.length) return;

    const temp = newSteps[idx];
    newSteps[idx] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;

    setDraftFlow({ ...draftFlow, steps: newSteps });
  };

  const addBlock = (type: AutomationStep['type'], title: string, desc: string) => {
    if (!draftFlow) return;
    const newStep: AutomationStep = {
      id: `step_${Date.now()}`,
      type,
      title,
      desc,
      config: { message: '' } // default config
    };
    setDraftFlow({
      ...draftFlow,
      steps: [...draftFlow.steps, newStep]
    });
    setActiveStepId(newStep.id);
  };

  const removeBlock = (stepId: string) => {
    if (!draftFlow) return;
    const newSteps = draftFlow.steps.filter(s => s.id !== stepId);
    setDraftFlow({ ...draftFlow, steps: newSteps });
    if (activeStepId === stepId) setActiveStepId(newSteps[0]?.id || null);
  };

  const updateActiveBlockConfig = (key: string, value: any) => {
    if (!draftFlow || !activeStepId) return;
    const newSteps = draftFlow.steps.map(s => {
      if (s.id === activeStepId) {
        return { ...s, config: { ...s.config, [key]: value } };
      }
      return s;
    });
    setDraftFlow({ ...draftFlow, steps: newSteps });
  };

  const availableBlocks: { type: AutomationStep['type'], title: string, desc: string }[] = [
    { type: 'whatsapp', title: 'Enviar WhatsApp', desc: 'Dispara uma mensagem de WhatsApp' },
    { type: 'email', title: 'Enviar E-mail', desc: 'Envia um e-mail com template' },
    { type: 'delay', title: 'Atraso Inteligente', desc: 'Espera X horas ou dias' },
    { type: 'condition', title: 'Condição (Se / Senão)', desc: 'Bifurca o caminho baseado em regras' },
  ];

  // --- RENDER VISUALIZATION MODE ---
  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Left Column: Automation list */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* WhatsApp Connection Widget */}
          <GlassCard className="p-5 border border-white/[0.04]" glow={wpStatus.ready}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  "w-2.5 h-2.5 rounded-full animate-pulse",
                  wpStatus.ready ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                )}></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Conexão WhatsApp</span>
              </div>
              {!wpStatus.ready && (
                <button 
                  onClick={() => setQrRefreshKey(prev => prev + 1)}
                  className="p-1 rounded bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Atualizar QR Code"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>

            {wpStatus.ready ? (
              <div className="space-y-2 text-xs">
                <p className="text-gray-400 leading-relaxed">
                  Automação de disparos via WhatsApp Web está <strong className="text-emerald-400">ativa e pronta</strong>! Todos os novos leads receberão as mensagens automáticas configuradas.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium flex items-center justify-between">
                  <span>🟢 Conectado ao número da agência</span>
                  <button 
                    onClick={async () => {
                      await whatsappApi.disconnect();
                      setWpStatus({ ready: false, qrAvailable: false });
                    }}
                    className="px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  >
                    Desconectar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs text-center flex flex-col items-center">
                <p className="text-gray-400 leading-relaxed text-left">
                  Para conectar, escaneie o QR Code abaixo no seu aplicativo do WhatsApp, ou clique em conectar para realizar uma simulação instantânea de login.
                </p>
                
                {wpStatus.qrAvailable ? (
                  <div className="p-3 bg-white rounded-xl inline-block shadow-lg border border-white/[0.1] relative group">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="WhatsApp Web QR Code" 
                        className="w-64 h-64 object-contain rounded bg-white"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center text-gray-500">Carregando QR...</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setQrRefreshKey(prev => prev + 1)}
                        className="px-3 py-1.5 rounded-lg bg-neon-indigo text-white font-semibold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={10} /> Recarregar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-neon-indigo border-t-transparent animate-spin"></div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aguardando API...</span>
                  </div>
                )}

                <button 
                  onClick={async () => {
                    await whatsappApi.connect();
                    setWpStatus({ ready: true, qrAvailable: false });
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors w-full flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> Conectar Número
                </button>
                
                <span className="text-[9px] text-gray-500 block">Atualização automática em tempo real</span>
              </div>
            )}
          </GlassCard>

          <div className="flex items-center justify-between mb-2 px-1 pt-2">
            <div className="flex items-center gap-2">
              <Cpu className="text-neon-indigo" size={18} />
              <h3 className="text-md font-display font-semibold text-white">Sequências Ativas</h3>
            </div>
            <button 
              onClick={startNewFlow}
              className="bg-neon-indigo/20 text-neon-indigo hover:bg-neon-indigo/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Novo Fluxo
            </button>
          </div>

          {automations.map((flow) => {
            const isSelected = flow.id === selectedFlowId;
            const isActive = flow.status === 'active';

            return (
              <GlassCard
                key={flow.id}
                onClick={() => setSelectedFlowId(flow.id)}
                className={clsx(
                  "p-5 transition-all relative border overflow-hidden cursor-pointer",
                  isSelected 
                    ? "border-neon-indigo/35 bg-white/[0.02]" 
                    : "border-white/[0.04] bg-white/[0.005] hover:border-white/[0.08]"
                )}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-indigo to-neon-cyan"></div>
                )}
                
                <div className="flex items-start justify-between gap-4">
                  <div className="truncate">
                    <span className="block font-semibold text-xs text-white truncate">{flow.name}</span>
                    <span className="text-[10px] text-gray-500 block truncate mt-1">{flow.description}</span>
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAutomationStatus(flow.id); }}
                    className={clsx(
                      "p-1.5 rounded-lg border transition-colors flex-shrink-0",
                      isActive 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/25"
                    )}
                    title={isActive ? "Pausar Fluxo" : "Ativar Fluxo"}
                  >
                    {isActive ? <Play size={12} /> : <Pause size={12} />}
                  </button>
                </div>

                <div className="flex items-center gap-6 mt-4 pt-3.5 border-t border-white/[0.03] text-[10px] text-gray-400">
                  <div>
                    <span className="block text-gray-500 font-bold uppercase tracking-wider text-[8px]">Ações</span>
                    <span className="text-white font-medium block mt-0.5">{flow.steps.length} blocos</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase tracking-wider text-[8px]">Ativos</span>
                    <span className="text-white font-medium block mt-0.5">{flow.activeLeads}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Right Column: Workflow visualizer tree */}
        <div className="lg:col-span-2 space-y-4">
          {activeFlow ? (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-md font-display font-semibold text-white">Visualização de Workflow</h3>
                <div className="flex items-center gap-3">
                  {activeFlow.status === 'active' ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <CheckCircle2 size={10} /> Funcionando
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <AlertCircle size={10} /> Pausado
                    </span>
                  )}
                  <button onClick={editExistingFlow} className="bg-white/[0.05] border border-white/[0.1] px-3 py-1.5 rounded-lg text-xs hover:bg-white/[0.1] transition-colors text-white">
                    Editar Fluxo
                  </button>
                </div>
              </div>

              <GlassCard className="p-6 md:p-8 flex flex-col items-center justify-start min-h-[480px] relative overflow-auto" glow>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.06),rgba(255,255,255,0))]"></div>
                
                <div className="relative flex flex-col items-center gap-4 py-8 w-full max-w-sm">
                  {activeFlow.steps.map((step: any, idx: number) => {
                    const isLast = idx === activeFlow.steps.length - 1;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-panel w-full border-white/[0.04] shadow-lg relative">
                          <div className="flex items-center gap-3">
                            <div className={clsx("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", getStepColorClass(step.type))}>
                              {getStepIcon(step.type)}
                            </div>
                            <div>
                              <span className="block text-xs font-semibold text-white">{step.title}</span>
                              <span className="text-[10px] text-gray-500 block truncate mt-0.5">{step.desc}</span>
                            </div>
                          </div>
                        </div>

                        {!isLast && (
                          <div className="flex flex-col items-center">
                            <div className="w-[1.5px] h-6 bg-gradient-to-b from-white/[0.06] to-white/[0.1]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-indigo shadow-glow-indigo"></div>
                            <div className="w-[1.5px] h-6 bg-gradient-to-b from-white/[0.1] to-white/[0.06]"></div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </GlassCard>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Nenhum fluxo selecionado.</div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER BUILDER MODE ---
  const activeStep = draftFlow?.steps.find(s => s.id === activeStepId);

  return (
    <div className="flex flex-col h-[80vh] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl bg-surface animate-in fade-in zoom-in-95 duration-200">
      {/* Builder Header */}
      <div className="h-14 border-b border-white/[0.05] flex items-center justify-between px-6 bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-neon-indigo/20 flex items-center justify-center">
            <Settings2 size={16} className="text-neon-indigo" />
          </div>
          <input 
            type="text" 
            value={draftFlow?.name || ''} 
            onChange={(e) => setDraftFlow(prev => prev ? { ...prev, name: e.target.value } : null)}
            className="bg-transparent border-none outline-none text-white font-semibold focus:ring-0 w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white px-3 py-1.5 text-xs">
            Cancelar
          </button>
          <button onClick={saveFlow} className="bg-neon-indigo text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-indigo-500 transition-colors shadow-glow-indigo">
            <Save size={14} /> Salvar Automação
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Blocks Palette (Left Sidebar) */}
        <div className="w-64 border-r border-white/[0.05] bg-black/20 p-4 overflow-y-auto hidden md:block">
          <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-4">Adicionar Blocos</h4>
          <div className="space-y-3">
            {availableBlocks.map(block => (
              <button 
                key={block.type}
                onClick={() => addBlock(block.type, block.title, block.desc)}
                className="w-full text-left p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] transition-colors group cursor-pointer flex gap-3"
              >
                <div className={clsx("w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5", getStepColorClass(block.type))}>
                  {getStepIcon(block.type)}
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-200 group-hover:text-white">{block.title}</span>
                  <span className="text-[9px] text-gray-500 block leading-tight mt-1">{block.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas (Center) */}
        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 relative overflow-auto p-8 flex flex-col items-center">
          <div className="absolute inset-0 bg-primary/90 pointer-events-none"></div> {/* Dark overlay over texture */}
          
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4">
            {draftFlow && draftFlow.steps.map((step: any, idx: number) => (
              <SortableStepItem
                key={step.id}
                id={step.id}
                step={step}
                idx={idx}
                totalSteps={draftFlow.steps.length}
                isActiveStep={step.id === activeStepId}
                getStepColorClass={getStepColorClass}
                getStepIcon={getStepIcon}
                setActiveStepId={setActiveStepId}
                removeBlock={removeBlock}
                moveBlock={moveBlock}
              />
            ))}
          </div>
        </div>

        {/* Config Panel (Right Sidebar) */}
        <div className="w-72 border-l border-white/[0.05] bg-black/40 p-5 overflow-y-auto">
          {activeStep ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.05]">
                <div className={clsx("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", getStepColorClass(activeStep.type))}>
                  {getStepIcon(activeStep.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{activeStep.title}</h4>
                  <span className="text-[10px] text-gray-500">Configuração do Bloco</span>
                </div>
              </div>

              {activeStep.type === 'trigger' && (
                <div className="space-y-4">
                  <label className="text-xs font-medium text-gray-400">Fonte do Lead</label>
                  <select className="w-full bg-[#1e293b]/50 border border-white/[0.1] rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-neon-indigo">
                    <option>Formulário do Site</option>
                    <option>Meta Ads (Lead Form)</option>
                    <option>API / Webhook Customizado</option>
                  </select>
                </div>
              )}

              {activeStep.type === 'whatsapp' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Mensagem do WhatsApp</label>
                  <textarea 
                    rows={6}
                    value={(activeStep.config?.message as string) || ''}
                    onChange={(e) => updateActiveBlockConfig('message', e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-white/[0.1] rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                    placeholder="Ex: Olá {nome}, vi que você se interessou pela Klyon..."
                  />
                  <p className="text-[9px] text-gray-500">Use {'{nome}'} para injetar o nome do lead.</p>
                </div>
              )}

              {activeStep.type === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">Assunto do Email</label>
                    <input 
                      type="text"
                      value={(activeStep.config?.subject as string) || ''}
                      onChange={(e) => updateActiveBlockConfig('subject', e.target.value)}
                      className="w-full bg-[#1e293b]/50 border border-white/[0.1] rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-neon-indigo"
                      placeholder="Bem-vindo à Klyon Digital"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">Corpo (HTML/Texto)</label>
                    <textarea 
                      rows={5}
                      value={(activeStep.config?.body as string) || ''}
                      onChange={(e) => updateActiveBlockConfig('body', e.target.value)}
                      className="w-full bg-[#1e293b]/50 border border-white/[0.1] rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-neon-indigo resize-none"
                    />
                  </div>
                </div>
              )}

              {activeStep.type === 'delay' && (
                <div className="space-y-4">
                  <label className="text-xs font-medium text-gray-400 block mb-1">Tempo de Espera</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={(activeStep.config?.time as number) || 1}
                      onChange={(e) => updateActiveBlockConfig('time', parseInt(e.target.value))}
                      className="w-20 bg-[#1e293b]/50 border border-white/[0.1] rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500"
                    />
                    <select 
                      value={(activeStep.config?.unit as string) || 'days'}
                      onChange={(e) => updateActiveBlockConfig('unit', e.target.value)}
                      className="flex-1 bg-[#1e293b]/50 border border-white/[0.1] rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500"
                    >
                      <option value="minutes">Minutos</option>
                      <option value="hours">Horas</option>
                      <option value="days">Dias</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-xs mt-10">
              Clique em um bloco para configurar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
