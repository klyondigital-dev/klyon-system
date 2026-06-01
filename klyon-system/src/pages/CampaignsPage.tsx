import React, { useState } from 'react';
import type { Lead, Campaign, Client, Transaction, AutomationFlow, DashboardMetrics, FinancialSummary } from '../types';
import { campaignsApi } from '../api';
import { GlassCard } from '../components/GlassCard';
import { MetricCard } from '../components/MetricCard';
import { CampaignReportModal } from '../components/CampaignReportModal';
import { Award, BarChart3, TrendingUp, Cpu, ToggleLeft, ToggleRight, DollarSign, MousePointer, Activity, Eye } from 'lucide-react';
import clsx from 'clsx';

interface CampaignsPageProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ campaigns, setCampaigns }) => {
  const [editingBudgetCampaignId, setEditingBudgetCampaignId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<number>(0);
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<Campaign | null>(null);

  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);

  // Computations
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const averageCPA = totalConversions > 0 ? totalSpent / totalConversions : 0;

  const toggleCampaignStatus = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    // Optimistic UI update
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    try {
      await campaignsApi.update(id, { status: newStatus });
    } catch (err) {
      console.error('Erro ao atualizar status', err);
      // Revert on error
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: campaign.status } : c))
      );
    }
  };

  const handleEditBudget = (id: string, currentBudget: number) => {
    setEditingBudgetCampaignId(id);
    setTempBudget(currentBudget);
  };

  const handleSaveBudget = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    const oldBudget = campaign.spent;

    // Optimistic UI update
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, spent: tempBudget } : c))
    );
    setEditingBudgetCampaignId(null);

    try {
      await campaignsApi.update(id, { spent: tempBudget });
    } catch (err) {
      console.error('Erro ao atualizar orçamento', err);
      // Revert on error
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, spent: oldBudget } : c))
      );
    }
  };

  const getPlatformIcon = (platform: Campaign['platform']) => {
    switch (platform) {
      case 'meta':
        return <span className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">Meta</span>;
      case 'google':
        return <span className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">Goog</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Ads KPIs Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Verba Total Veiculada"
          value={totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          trend={8.2}
          sparklineData={[11000, 11500, 12000, 12800, 13100, 13431]}
          icon={DollarSign}
          accentColor="indigo"
        />
        <MetricCard
          title="Leads Gerados"
          value={totalConversions}
          trend={12.4}
          sparklineData={[600, 640, 680, 710, 725, 742]}
          icon={Activity}
          accentColor="cyan"
        />
        <MetricCard
          title="CPC Médio"
          value={`R$ ${averageCPC.toFixed(2)}`}
          trend={-5.8} // negative is good for CPC!
          sparklineData={[1.35, 1.30, 1.28, 1.25, 1.22, 1.19]}
          icon={MousePointer}
          accentColor="pink"
        />
        <MetricCard
          title="CPA Médio"
          value={`R$ ${averageCPA.toFixed(2)}`}
          trend={-9.4} // negative is good for CPA!
          sparklineData={[22.50, 21.80, 20.90, 19.50, 18.80, 18.10]}
          icon={Award}
          accentColor="indigo"
        />
      </div>

      {/* Platforms Budget Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['meta', 'google'].map((platform) => {
          const platformCamps = campaigns.filter((c) => c.platform === platform);
          const platformSpent = platformCamps.reduce((acc, c) => acc + c.spent, 0);
          const platformConversions = platformCamps.reduce((acc, c) => acc + c.conversions, 0);
          const platformCPA = platformConversions > 0 ? platformSpent / platformConversions : 0;
          const share = totalSpent > 0 ? (platformSpent / totalSpent) * 100 : 0;

          return (
            <GlassCard key={platform} className="p-5 flex flex-col justify-between" glow>
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider capitalize">{platform} Ads</span>
                {getPlatformIcon(platform as any)}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Investimento</span>
                    <h4 className="text-lg font-display font-bold text-white mt-0.5">R$ {platformSpent.toLocaleString('pt-BR')}</h4>
                  </div>
                  <span className="text-[10px] font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20">
                    {share.toFixed(0)}% do budget
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full",
                      platform === 'meta' && 'bg-blue-500',
                      platform === 'google' && 'bg-emerald-500'
                    )}
                    style={{ width: `${share}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 pt-2 font-semibold">
                  <span>Leads: {platformConversions}</span>
                  <span>CPA: R$ {platformCPA.toFixed(2)}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Campaigns list Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-neon-indigo" size={18} />
          <h3 className="text-md font-display font-semibold text-white">Todas as Campanhas Ativas</h3>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-surface/50 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01] text-xs text-gray-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Campanha / Canal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">CTR</th>
                  <th className="p-4">CPC</th>
                  <th className="p-4">CPA</th>
                  <th className="p-4">Leads</th>
                  <th className="p-4 text-right">Investimento (Gasto)</th>
                  <th className="p-4 text-right pr-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors text-xs">
                    <td className="p-4 pl-6">
                      <span className="block text-sm font-semibold text-white">{c.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5 block">{c.platform} Ads</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleCampaignStatus(c.id)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title={c.status === 'active' ? 'Pausar Campanha' : 'Ativar Campanha'}
                      >
                        {c.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">Ativa</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">Pausada</span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-gray-300 font-medium">{c.ctr}%</td>
                    <td className="p-4 text-gray-300">R$ {c.cpc.toFixed(2)}</td>
                    <td className="p-4 text-gray-300">R$ {c.cpa.toFixed(2)}</td>
                    <td className="p-4 text-sm font-semibold text-white font-display">{c.conversions}</td>
                    <td className="p-4 text-right font-display font-semibold text-neon-cyan">
                      {editingBudgetCampaignId === c.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            value={tempBudget}
                            onChange={(e) => setTempBudget(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.1] text-xs text-white text-right focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveBudget(c.id)}
                            className="p-1 rounded bg-neon-indigo text-white hover:bg-neon-indigo/80 cursor-pointer"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditBudget(c.id, c.spent)}
                          className="hover:underline cursor-pointer"
                          title="Ajustar verba"
                        >
                          R$ {c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        onClick={() => setSelectedCampaignReport(c)}
                        className="p-1.5 rounded bg-white/[0.03] border border-white/[0.05] text-neon-cyan hover:bg-neon-cyan/10 hover:text-white transition-colors cursor-pointer"
                        title="Ver Relatório Avançado"
                      >
                        <BarChart3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Advanced Report Modal */}
      {selectedCampaignReport && (
        <CampaignReportModal 
          campaign={selectedCampaignReport} 
          onClose={() => setSelectedCampaignReport(null)} 
        />
      )}
    </div>
  );
};
