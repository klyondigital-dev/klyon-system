import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, Campaign, Client, Transaction, AutomationFlow, DashboardMetrics, FinancialSummary } from '../types';
import { GlassCard } from '../components/GlassCard';
import { calculateDashboardMetrics } from '../mockData';
import { AIAnalyzer } from '../utils/AIAnalyzer';
import { FileText, Printer, Calendar, Download, Sparkles, Filter, ChevronDown, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

interface ReportsProps {
  clients: Client[];
  campaigns: Campaign[];
  leads: Lead[];
}

export const Reports: React.FC<ReportsProps> = ({ clients, campaigns, leads }) => {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<string>('may_2026');
  const [aiText, setAiText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Geração de Insights com IA Heurística
  useEffect(() => {
    const fullText = AIAnalyzer.generateInsights(leads, campaigns, []);
    let i = 0;
    setAiText('');
    setIsTyping(true);
    
    const interval = setInterval(() => {
      setAiText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15); // velocidade de digitação

    return () => clearInterval(interval);
  }, [leads, campaigns]);

  // Filter metrics based on selected client
  const currentMetrics = useMemo(() => {
    if (selectedClient === 'all') {
      return calculateDashboardMetrics(campaigns, leads);
    }
    // Filter campaigns and leads for the specific client
    const clientObj = clients.find(c => c.id === selectedClient);
    if (!clientObj) return calculateDashboardMetrics(campaigns, leads);

    // Filter leads matching the company name
    const clientLeads = leads.filter(l => l.company.toLowerCase() === clientObj.company.toLowerCase());
    
    // Simulate campaigns specific to the client (we can map c1/c2 to meta/google)
    const clientCampaigns = campaigns.map(c => {
      // Scale down numbers realistically for individual client simulation
      const factor = selectedClient === 'cli1' ? 0.6 : selectedClient === 'cli2' ? 0.25 : 0.4;
      return {
        ...c,
        spent: c.spent * factor,
        conversions: Math.floor(c.conversions * factor),
        clicks: Math.floor(c.clicks * factor),
        impressions: Math.floor(c.impressions * factor)
      };
    });

    return calculateDashboardMetrics(clientCampaigns, clientLeads);
  }, [selectedClient, clients, campaigns, leads]);


  const activeClientName = selectedClient === 'all' 
    ? 'Consolidado (Agência)' 
    : clients.find(c => c.id === selectedClient)?.company || '';

  const getClientObjectives = () => {
    if (selectedClient === 'all') {
      return [
        'Aumentar o ROI consolidado das mídias pagas em 10% no próximo mês.',
        'Reduzir o CPA médio otimizando a veiculação no canal do Google Display.',
        'Integrar novos fluxos de recuperação por WhatsApp para diminuir a taxa de leads frios.'
      ];
    }
    if (selectedClient === 'cli1') {
      return [
        'Escalar captação de integradores B2B de insumos agrícolas no centro-oeste.',
        'Otimizar a landing page para dispositivos móveis.',
        'Aumentar investimento do Google Search em termos de intenção de compra.'
      ];
    }
    return [
      'Fortalecer captação de leads qualificados no WhatsApp local.',
      'Reduzir custo por agendamento de briefing comercial.',
      'Refinar criativos de vídeo focado em dores de consultoria.'
    ];
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 print-area">
      
      {/* Filters bar - Hidden in Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/50 border border-white/[0.04] p-4 rounded-2xl print:hidden">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={14} />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Filtrar Relatório:</span>
          </div>
          
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 cursor-pointer"
          >
            <option value="all" className="bg-surface">Relatório Consolidado Klyon</option>
            {clients.map(c => (
              <option key={c.id} value={c.id} className="bg-surface">{c.company}</option>
            ))}
          </select>

          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 cursor-pointer"
          >
            <option value="may_2026" className="bg-surface">Maio de 2026 (Atual)</option>
            <option value="apr_2026" className="bg-surface">Abril de 2026</option>
            <option value="q1_2026" className="bg-surface">1º Trimestre 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
          >
            <Printer size={14} /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Módulo Klyon AI Insights */}
      <GlassCard className="relative overflow-hidden border-neon-indigo/30 bg-indigo-900/10">
        <div className="absolute top-0 left-0 w-1 h-full bg-neon-indigo shadow-[0_0_15px_rgba(79,70,229,0.8)]"></div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-glow-indigo">
              <span className="text-white font-bold text-lg">✨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Klyon AI Insights</h2>
              <p className="text-sm text-indigo-300">Consultoria automatizada em tempo real</p>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-5 border border-white/5 relative">
            <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {aiText}
              {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-neon-indigo animate-pulse"></span>}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Report Page Structure */}
      <GlassCard className="p-8 md:p-12 border border-white/[0.06] bg-surface-card print:border-none print:shadow-none print:bg-[#0e0e14] print:p-8">
        
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-white/[0.08] pb-6 print:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-neon-indigo to-neon-cyan flex items-center justify-center font-display font-bold text-white shadow-glow-indigo text-lg">
                K
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Klyon <span className="text-neon-cyan text-xs font-semibold">digital</span>
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-4 tracking-tight">Relatório Mensal de Performance</h2>
            <span className="text-xs text-gray-500 block mt-0.5 print:text-gray-400">Período: 01 de Maio de 2026 a 25 de Maio de 2026</span>
          </div>
          
          <div className="mt-4 sm:mt-0 text-left sm:text-right text-xs text-gray-400 space-y-1 print:text-gray-300">
            <p><strong>Cliente:</strong> {activeClientName}</p>
            <p><strong>Gerado em:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Responsável:</strong> Klyon Marketing Agency</p>
          </div>
        </div>

        {/* Financial KPI Summary Table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Investimento Total</span>
            <span className="text-lg font-display font-bold text-white block mt-1.5">
              R$ {currentMetrics.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Faturamento Vendas</span>
            <span className="text-lg font-display font-bold text-white block mt-1.5">
              R$ {currentMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Retorno (ROI)</span>
            <span className="text-lg font-display font-bold text-neon-cyan block mt-1.5">
              {currentMetrics.roi.toFixed(1)}x
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Leads Conquistados</span>
            <span className="text-lg font-display font-bold text-white block mt-1.5">
              {currentMetrics.totalLeads}
            </span>
          </div>
        </div>

        {/* Simulated conversion funnel display */}
        <div className="border-t border-white/[0.06] pt-8 mb-8">
          <h3 className="text-sm font-display font-bold text-white tracking-wide uppercase mb-6">Funil de Vendas e Conversão</h3>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Step 1: Impressions */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                <span>1. Visualizações de Anúncios (Impressões)</span>
                <span className="font-semibold text-white">125.000 visualizações</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <div className="h-full bg-neon-indigo w-full"></div>
              </div>
            </div>

            {/* Step 2: Clicks */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                <span>2. Cliques no Link (Tráfego)</span>
                <span className="font-semibold text-white">4.820 cliques (CTR 3.8%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <div className="h-full bg-neon-cyan w-[65%]"></div>
              </div>
            </div>

            {/* Step 3: Leads */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                <span>3. Leads Comerciais Cadastrados</span>
                <span className="font-semibold text-white">{currentMetrics.totalLeads} cadastros</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <div className="h-full bg-neon-pink w-[35%]"></div>
              </div>
            </div>

            {/* Step 4: Closed sales */}
            <div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
                <span>4. Contratos Fechados (Vendas)</span>
                <span className="font-semibold text-neon-cyan font-bold">
                  {Math.round(currentMetrics.totalLeads * currentMetrics.conversionRate / 100)} fechamentos ({currentMetrics.conversionRate.toFixed(1)}% conv.)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-indigo to-neon-cyan w-[20%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations & Actionable items */}
        <div className="border-t border-white/[0.06] pt-8">
          <h3 className="text-sm font-display font-bold text-white tracking-wide uppercase mb-4">Próximos Passos & Insights de Crescimento</h3>
          <div className="space-y-3">
            {getClientObjectives().map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed">
                <CheckSquare size={14} className="text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Signatures */}
        <div className="hidden print:flex justify-between items-end mt-20 pt-10 border-t border-white/20 text-xs text-gray-400">
          <div className="text-center w-56">
            <div className="h-[1px] bg-white/40 w-full mb-2"></div>
            <span>Gestor de Tráfego - Klyon Digital</span>
          </div>
          
          <div className="text-center w-56">
            <div className="h-[1px] bg-white/40 w-full mb-2"></div>
            <span>Diretoria Comercial / Cliente</span>
          </div>
        </div>

      </GlassCard>
    </div>
  );
};
