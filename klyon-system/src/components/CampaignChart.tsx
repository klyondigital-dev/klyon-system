import React, { useState, useMemo } from 'react';
import type { Campaign } from '../types';
import { GlassCard } from './GlassCard';
import { BarChart3, Activity } from 'lucide-react';
import clsx from 'clsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CampaignChartProps {
  campaigns: Campaign[];
}

type MetricType = 'spent' | 'conversions' | 'roi' | 'cpa' | 'ctr' | 'roas';

export const CampaignChart: React.FC<CampaignChartProps> = ({ campaigns }) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('spent');

  const maxVal = Math.max(...campaigns.map(c => c[activeMetric] || 0));

  const getPlatformIcon = (platform: Campaign['platform']) => {
    switch (platform) {
      case 'meta':
        return (
          <span className="w-6 h-6 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            M
          </span>
        );
      case 'google':
        return (
          <span className="w-6 h-6 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            G
          </span>
        );
    }
  };

  const getPlatformStyle = (platform: Campaign['platform']) => {
    switch (platform) {
      case 'meta': return { 
        bg: 'bg-blue-500', 
        gradient: 'from-blue-600 to-blue-400', 
        shadow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]' 
      };
      case 'google': return { 
        bg: 'bg-emerald-500', 
        gradient: 'from-emerald-600 to-emerald-400', 
        shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]' 
      };
    }
  };

  const formatMetricValue = (value: number | undefined, metric: MetricType) => {
    if (value === undefined || value === null) return '-';
    if (metric === 'spent' || metric === 'cpa') {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    if (metric === 'roi' || metric === 'roas') {
      return `${value.toFixed(1)}x`;
    }
    if (metric === 'ctr') {
      return `${value.toFixed(2)}%`;
    }
    return `${value} leads`;
  };

  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'spent': return 'Verba';
      case 'conversions': return 'Leads';
      case 'roi': return 'ROI';
      case 'cpa': return 'CPA';
      case 'ctr': return 'CTR';
      case 'roas': return 'ROAS';
    }
  };

  // Group stats for platforms
  const platformStats = campaigns.reduce((acc, c) => {
    if (!acc[c.platform]) {
      acc[c.platform] = { spent: 0, conversions: 0, count: 0 };
    }
    acc[c.platform].spent += c.spent;
    acc[c.platform].conversions += c.conversions;
    acc[c.platform].count += 1;
    return acc;
  }, {} as Record<Campaign['platform'], { spent: number; conversions: number; count: number }>);

  // Generate simulated history data based on activeMetric
  const historyData = useMemo(() => {
    const days = 14;
    const data = [];
    const baseValue = campaigns.reduce((sum, c) => sum + (c[activeMetric] || 0), 0) / days;
    
    // Create an ascending trend curve with some noise
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const noise = (Math.random() - 0.5) * 0.4;
      const trend = 1 - (i / days) * 0.5; // Starts at 50% of final value
      
      let val = baseValue * trend * (1 + noise);
      if (activeMetric === 'roi' || activeMetric === 'roas') val = 3 + (trend * 2) + noise;
      if (activeMetric === 'ctr') val = 1 + (trend * 2) + noise;
      
      data.push({
        date: dayLabel,
        value: Math.max(0, val)
      });
    }
    return data;
  }, [campaigns, activeMetric]);

  const totalSpentAll = Object.values(platformStats).reduce((sum, p) => sum + p.spent, 0);

  // Determine chart colors based on metric
  const getChartColor = () => {
    switch (activeMetric) {
      case 'spent': return '#ec4899'; // pink
      case 'roi': return '#06b6d4'; // cyan
      case 'conversions': return '#10b981'; // emerald
      default: return '#6366f1'; // indigo
    }
  };
  const chartColor = getChartColor();

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between">
      <div>
        {/* Title and metric selector */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.04] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-neon-cyan" size={18} />
            <h3 className="text-md font-display font-semibold text-white">Desempenho de Campanhas</h3>
          </div>
          
          <div className="flex flex-wrap rounded-lg bg-white/[0.02] border border-white/[0.04] p-1 self-start xl:self-auto gap-1">
            {(['spent', 'conversions', 'roi', 'cpa', 'ctr', 'roas'] as MetricType[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer",
                  activeMetric === metric
                    ? "bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {getMetricLabel(metric)}
              </button>
            ))}
          </div>
        </div>

        {/* Area Chart Section */}
        <div className="h-48 w-full mb-8 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => activeMetric === 'spent' ? `R$${val/1000}k` : val.toFixed(1)} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: chartColor, fontWeight: 'bold' }}
                formatter={(value: any) => [formatMetricValue(Number(value), activeMetric), getMetricLabel(activeMetric)]}
                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMetric)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic List Area */}
        <div className="space-y-4">
          {campaigns.map((camp) => {
            const currentVal = camp[activeMetric] || 0;
            const percentage = maxVal > 0 ? (currentVal / maxVal) * 100 : 0;
            const style = getPlatformStyle(camp.platform) || { gradient: '', text: '', bg: '', shadow: '' };
            
            return (
              <div key={camp.id} className="relative p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 group overflow-hidden">
                {/* Neon Background Glow on Hover */}
                <div className={clsx("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r", style.gradient)}></div>
                
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-3 truncate max-w-[70%]">
                      {getPlatformIcon(camp.platform)}
                      <span className="text-gray-200 group-hover:text-white truncate transition-colors text-sm font-semibold">{camp.name}</span>
                      {camp.status === 'paused' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">Pausada</span>
                      )}
                    </div>
                    <span className="font-display font-bold text-white text-sm">
                      {formatMetricValue(currentVal, activeMetric)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r relative",
                        style.gradient,
                        camp.status === 'paused' ? 'opacity-35 grayscale' : style.shadow
                      )}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Badges instead of text */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] text-[9px] font-medium text-gray-400">
                      CTR: <strong className="text-gray-200">{camp.ctr}%</strong>
                    </span>
                    <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] text-[9px] font-medium text-gray-400">
                      CPC: <strong className="text-gray-200">R$ {camp.cpc.toFixed(2)}</strong>
                    </span>
                    <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] text-[9px] font-medium text-gray-400">
                      CPA: <strong className="text-gray-200">R$ {camp.cpa.toFixed(2)}</strong>
                    </span>
                    {camp.cpm !== undefined && (
                      <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05] text-[9px] font-medium text-gray-400">
                        CPM: <strong className="text-gray-200">R$ {camp.cpm.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Widget */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-6 mt-8">
        {Object.entries(platformStats).map(([platform, stats]) => {
          const platPercentage = totalSpentAll > 0 ? (stats.spent / totalSpentAll) * 100 : 0;
          const style = getPlatformStyle(platform as Campaign['platform']) || { gradient: '', text: '', bg: '', shadow: '' };
          
          return (
            <div key={platform} className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.02] text-center hover:border-white/[0.06] transition-colors">
              <span className="text-[10px] font-semibold text-gray-400 capitalize block">{platform} Ads</span>
              <span className="font-display font-bold text-lg text-white block mt-1">R$ {stats.spent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className={clsx("w-2 h-2 rounded-full", style.bg, style.shadow)}></div>
                <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">{platPercentage.toFixed(0)}% do budget</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
