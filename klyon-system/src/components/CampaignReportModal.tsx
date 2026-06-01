import React, { useMemo, useState } from 'react';
import type { Campaign } from '../types';
import { GlassCard } from './GlassCard';
import { X, TrendingUp, BarChart3, Activity, Download, MousePointerClick, Users, Eye, Target, DollarSign, Crosshair, Clock } from 'lucide-react';
import clsx from 'clsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CampaignReportModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export const CampaignReportModal: React.FC<CampaignReportModalProps> = ({ campaign, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial'>('overview');

  // Gerar um histórico simulado (Mock) com base nos totais da campanha, para dar vida ao gráfico
  const chartData = useMemo(() => {
    const data = [];
    const days = 14; // últimos 14 dias
    
    // Distribuir os totais ao longo dos dias, com variação
    let accumulatedSpent = 0;
    let accumulatedLeads = 0;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayFactor = i === 0 ? 1 : Math.random() * 0.5 + 0.5; // Variação do dia
      const dailySpent = (campaign.spent / days) * dayFactor;
      const dailyLeads = (campaign.conversions / days) * dayFactor;

      accumulatedSpent += dailySpent;
      accumulatedLeads += dailyLeads;

      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        gasto: accumulatedSpent > campaign.spent && i === 0 ? campaign.spent : accumulatedSpent,
        leads: accumulatedLeads > campaign.conversions && i === 0 ? campaign.conversions : accumulatedLeads,
        cpaDiario: dailyLeads > 0 ? dailySpent / dailyLeads : 0
      });
    }
    
    // Fix the last item to match exact totals
    data[data.length - 1].gasto = campaign.spent;
    data[data.length - 1].leads = campaign.conversions;

    return data;
  }, [campaign]);

  // Fallbacks for optional new metrics
  const m = {
    roas: campaign.roas || (campaign.roi > 0 ? campaign.roi * 1.5 : 3.2),
    ticketMedio: campaign.ticketMedio || 1500,
    taxaConversao: campaign.taxaConversao || (campaign.conversions / (campaign.clicks || 1) * 100),
    ltv: campaign.ltv || 8500,
    cpm: campaign.cpm || (campaign.spent / (campaign.impressions || 1) * 1000) || 12.5,
    cpv: campaign.cpv || 0.15,
    cpv_x: campaign.cpv_x || 45,
    alcance: campaign.alcance || (campaign.impressions * 0.7) || 85000,
    frequencia: campaign.frequencia || (campaign.impressions / ((campaign.impressions * 0.7) || 1)) || 1.4,
    connectRate: campaign.connectRate || 85,
  };

  const MetricBox = ({ title, value, prefix = '', suffix = '', icon: Icon, colorClass = 'text-white' }: any) => (
    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-start justify-between">
      <div>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-1">{title}</span>
        <span className={clsx("font-display font-bold text-lg", colorClass)}>
          {prefix}{value}{suffix}
        </span>
      </div>
      {Icon && <Icon className="text-gray-600" size={16} />}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="fixed inset-0 bg-primary/95" onClick={onClose}></div>
      
      <GlassCard className="w-full max-w-6xl h-full max-h-[90vh] relative z-10 border border-white/[0.08] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/[0.04] flex items-start sm:items-center justify-between bg-white/[0.01] flex-col sm:flex-row gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {campaign.platform === 'meta' ? (
                <span className="px-2 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">Meta Ads</span>
              ) : (
                <span className="px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">Google Ads</span>
              )}
              <h2 className="text-xl font-display font-bold text-white">{campaign.name}</h2>
              {campaign.status === 'active' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              )}
            </div>
            <span className="text-xs text-gray-400">Relatório Avançado de Performance (Últimos 14 Dias)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/[0.05]">
              <button 
                onClick={() => setActiveTab('overview')}
                className={clsx("px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer", activeTab === 'overview' ? "bg-white/[0.08] text-white" : "text-gray-400 hover:text-white")}
              >
                Visão Geral
              </button>
              <button 
                onClick={() => setActiveTab('financial')}
                className={clsx("px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer", activeTab === 'financial' ? "bg-white/[0.08] text-white" : "text-gray-400 hover:text-white")}
              >
                Financeiro
              </button>
            </div>
            
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-gray-300 transition-colors border border-white/[0.04] cursor-pointer">
              <Download size={14} /> PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 transition-colors cursor-pointer border border-white/[0.04]">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* MAIN CHART AREA */}
          <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-neon-indigo" size={18} />
              <h3 className="text-sm font-semibold text-white">Evolução: Leads x Investimento</h3>
            </div>
            
            <div style={{ width: '100%', height: 250, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} axisLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickFormatter={(val) => Math.round(val).toString()} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickFormatter={(val) => `R$${Math.round(val)}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area isAnimationActive={false} yAxisId="left" type="monotone" dataKey="leads" name="Leads Gerados" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                  <Area isAnimationActive={false} yAxisId="right" type="monotone" dataKey="gasto" name="Investimento (R$)" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorGasto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DYNAMIC KPI GRID */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox title="Impressões Totais" value={campaign.impressions.toLocaleString('pt-BR')} icon={Eye} />
              <MetricBox title="Alcance (Pessoas)" value={m.alcance.toLocaleString('pt-BR')} icon={Users} colorClass="text-emerald-400" />
              <MetricBox title="Frequência" value={m.frequencia.toFixed(2)} icon={Clock} />
              <MetricBox title="Cliques no Link" value={campaign.clicks.toLocaleString('pt-BR')} icon={MousePointerClick} colorClass="text-blue-400" />
              
              <MetricBox title="Custo Por Mil (CPM)" value={m.cpm.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={BarChart3} />
              <MetricBox title="CTR (Taxa Cliques)" value={campaign.ctr.toFixed(2)} suffix="%" icon={MousePointerClick} />
              <MetricBox title="Custo Por Clique (CPC)" value={campaign.cpc.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={DollarSign} />
              <MetricBox title="Connect Rate" value={m.connectRate.toFixed(1)} suffix="%" icon={TrendingUp} colorClass="text-cyan-400" />

              <MetricBox title="Leads Captados" value={campaign.conversions} icon={Target} colorClass="text-white" />
              <MetricBox title="Custo Por Lead (CPA)" value={campaign.cpa.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={DollarSign} colorClass="text-rose-400" />
              <MetricBox title="Taxa Conversão LP" value={m.taxaConversao.toFixed(1)} suffix="%" icon={TrendingUp} />
              <MetricBox title="Visualização Vídeo (CPV)" value={m.cpv.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={Eye} />
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox title="Investimento (Spent)" value={campaign.spent.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={DollarSign} colorClass="text-white" />
              <MetricBox title="Custo Por Aquisição (CPA)" value={campaign.cpa.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={Crosshair} colorClass="text-rose-400" />
              <MetricBox title="Ticket Médio (Venda)" value={m.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={DollarSign} />
              <MetricBox title="LTV (Life Time Value)" value={m.ltv.toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={TrendingUp} colorClass="text-emerald-400" />

              <MetricBox title="Retorno Invest. (ROI)" value={campaign.roi.toFixed(1)} suffix="x" icon={TrendingUp} colorClass="text-neon-cyan" />
              <MetricBox title="ROAS (Retorno Mídia)" value={m.roas.toFixed(2)} suffix="x" icon={BarChart3} colorClass="text-neon-indigo" />
              <MetricBox title="Receita Estimada" value={(campaign.conversions * (m.taxaConversao/100) * m.ticketMedio).toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={DollarSign} colorClass="text-emerald-400" />
              <MetricBox title="Lucro Bruto (Mídia)" value={((campaign.conversions * (m.taxaConversao/100) * m.ticketMedio) - campaign.spent).toLocaleString('pt-BR', {minimumFractionDigits:2})} prefix="R$ " icon={DollarSign} colorClass="text-emerald-400" />
            </div>
          )}

        </div>
      </GlassCard>
    </div>
  );
};
