import React from 'react';
import { DollarSign, TrendingUp, Target, Users, ArrowUpRight, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';
import type { Lead, Campaign, Client, Transaction, AutomationFlow, DashboardMetrics, FinancialSummary } from '../types';
import { calculateDashboardMetrics } from '../mockData';
import { MetricCard } from '../components/MetricCard';
import { CampaignChart } from '../components/CampaignChart';
import { SalesFunnelChart } from '../components/SalesFunnelChart';
import { GlassCard } from '../components/GlassCard';
import clsx from 'clsx';

interface DashboardProps {
  campaigns: Campaign[];
  leads: Lead[];
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ campaigns, leads, setActiveTab }) => {
  const metrics = calculateDashboardMetrics(campaigns, leads);

  // Sorting recent leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">Novo</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">Contatado</span>;
      case 'qualified':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400">Qualificado</span>;
      case 'proposal':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Proposta</span>;
      case 'won':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Ganha</span>;
      case 'lost':
        return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">Perdida</span>;
    }
  };

  const getSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'meta':
        return <span className="w-5 h-5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px]">M</span>;
      case 'google':
        return <span className="w-5 h-5 rounded-md bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">G</span>;
      default:
        return <span className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-400 flex items-center justify-center text-[9px]">Org</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Premium Hero Welcome Banner */}
      <GlassCard className="p-6 md:p-8 bg-gradient-to-r from-neon-indigo/[0.08] via-neon-cyan/[0.02] to-transparent border border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-neon-cyan/5 to-transparent pointer-events-none blur-3xl"></div>
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-neon-cyan uppercase tracking-widest bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded-full">
              <Sparkles size={10} /> Alta Performance Ativa
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
            Olá, Alan. Pronto para acelerar hoje?
          </h2>
          <p className="text-sm text-gray-400 max-w-xl">
            Suas campanhas ativas geraram <strong className="text-white">34 leads</strong> nas últimas 48 horas, mantendo o ROI geral da agência em excelentes <strong className="text-neon-cyan">5.1x</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative z-10">

          <button
            onClick={() => setActiveTab('crm')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> Novo Lead no CRM
          </button>
        </div>
      </GlassCard>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento Fechado"
          value={metrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          trend={18.4}
          sparklineData={[50000, 58000, 62000, 60000, 68000, 75500, 80000, 67500].reverse()}
          icon={DollarSign}
          accentColor="indigo"
        />
        <MetricCard
          title="Verba de Anúncios"
          value={metrics.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          trend={4.2}
          sparklineData={[11000, 11500, 12000, 12800, 13100, 13431]}
          icon={TrendingUp}
          accentColor="pink"
        />
        <MetricCard
          title="ROI Geral"
          value={`${metrics.roi.toFixed(1)}x`}
          trend={8.5}
          sparklineData={[4.2, 4.5, 4.6, 4.8, 5.0, 5.1, 5.3, 5.2].reverse()}
          icon={Target}
          accentColor="cyan"
        />
        <MetricCard
          title="Total de Leads"
          value={metrics.totalLeads}
          trend={12.0}
          sparklineData={[8, 9, 8, 10, 11, 10]}
          icon={Users}
          accentColor="indigo"
        />
      </div>

      {/* Sales Funnel Full Width */}
      <div className="w-full">
        <SalesFunnelChart leads={leads} />
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Campaign chart - occupies 2 columns on lg screens */}
        <div className="lg:col-span-2">
          <CampaignChart campaigns={campaigns} />
        </div>

        {/* Recent leads lists - 1 column */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-5">
                <h3 className="text-md font-display font-semibold text-white">Leads Recentes</h3>
                <button
                  onClick={() => setActiveTab('crm')}
                  className="text-xs text-neon-cyan hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3 truncate max-w-[70%]">
                      {getSourceIcon(lead.source)}
                      <div className="truncate">
                        <span className="block text-xs font-semibold text-white truncate">{lead.name}</span>
                        <span className="text-[10px] text-gray-500 block truncate">{lead.company}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {getStatusBadge(lead.status)}
                      <span className="block text-[10px] font-bold text-gray-400 mt-1">R$ {lead.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro details panel at the bottom */}
            <div className="mt-8 border-t border-white/[0.04] pt-5 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Taxa de Conversão</span>
                <span className="font-display font-bold text-white text-emerald-400">{metrics.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">CPA Médio Pago</span>
                <span className="font-display font-bold text-white">R$ {metrics.averageCPA.toFixed(2)}</span>
              </div>
              
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start gap-2.5 text-[10px] text-gray-400 leading-relaxed">
                <ShieldAlert size={16} className="text-neon-cyan flex-shrink-0 mt-0.5" />
                <span>Para otimizar o CPA, sugerimos alocar R$ 400 adicionais da campanha de Display (Google) para a campanha ativa de Conversão (Meta).</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
