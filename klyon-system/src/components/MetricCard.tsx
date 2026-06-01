import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: number; // positive or negative percentage
  trendLabel?: string;
  sparklineData: number[]; // array of 6-8 numbers for mini-trend
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor?: 'indigo' | 'cyan' | 'pink';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendLabel = 'vs mês passado',
  sparklineData,
  icon: Icon,
  accentColor = 'indigo'
}) => {
  const isPositive = trend >= 0;

  // Generate SVG path for sparkline
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    // Invert y because SVG y goes down
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const getAccentClass = () => {
    switch (accentColor) {
      case 'cyan':
        return {
          iconBg: 'bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan',
          stroke: 'stroke-neon-cyan',
          gradientId: 'gradient-cyan',
          stopColor: '#06b6d4'
        };
      case 'pink':
        return {
          iconBg: 'bg-neon-pink/10 border-neon-pink/20 text-neon-pink',
          stroke: 'stroke-neon-pink',
          gradientId: 'gradient-pink',
          stopColor: '#ec4899'
        };
      case 'indigo':
      default:
        return {
          iconBg: 'bg-neon-indigo/10 border-neon-indigo/20 text-neon-indigo',
          stroke: 'stroke-neon-indigo',
          gradientId: 'gradient-indigo',
          stopColor: '#6366f1'
        };
    }
  };

  const accent = getAccentClass();

  return (
    <GlassCard className="p-6 relative overflow-hidden" glow>
      {/* Glow highlight in the corner */}
      <div className={clsx(
        "absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-300",
        accentColor === 'cyan' && "bg-neon-cyan",
        accentColor === 'pink' && "bg-neon-pink",
        accentColor === 'indigo' && "bg-neon-indigo"
      )}></div>

      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-display font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center transition-colors", accent.iconBg)}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-1.5">
          <span className={clsx(
            "flex items-center text-xs font-semibold px-2 py-0.5 rounded-lg border",
            isPositive 
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" 
              : "text-rose-400 bg-rose-500/10 border-rose-500/15"
          )}>
            {isPositive ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-[11px] text-gray-500">{trendLabel}</span>
        </div>

        {/* Custom Mini SVG Sparkline */}
        <div className="w-[120px] h-[40px] opacity-75 hover:opacity-100 transition-opacity duration-300">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={accent.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent.stopColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={accent.stopColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area Fill */}
            <path
              d={`M 0,${height} L ${points} L ${width},${height} Z`}
              fill={`url(#${accent.gradientId})`}
            />
            {/* Line Path */}
            <polyline
              fill="none"
              className={accent.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </GlassCard>
  );
};
