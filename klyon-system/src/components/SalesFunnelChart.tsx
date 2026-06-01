import React from 'react';
import type { Lead } from '../types';
import { GlassCard } from './GlassCard';
import { Filter, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SalesFunnelChartProps {
  leads: Lead[];
}

export const SalesFunnelChart: React.FC<SalesFunnelChartProps> = ({ leads }) => {
  // Ignorar leads perdidos para a visão principal do funil
  const activeLeads = leads.filter(l => l.status !== 'lost');
  
  const stages = [
    { id: 'new', label: 'Sem Contato', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30', text: 'text-blue-400' },
    { id: 'contacted', label: 'Contatado', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30', text: 'text-amber-400' },
    { id: 'qualified', label: 'Qualificado', color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', text: 'text-purple-400' },
    { id: 'proposal', label: 'Proposta', color: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    { id: 'won', label: 'Ganha', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  ];

  // Conta quantos leads ESTÃO ATUALMENTE em cada etapa
  const counts = stages.map(stage => activeLeads.filter(l => l.status === stage.id).length);
  const values = stages.map(stage => activeLeads.filter(l => l.status === stage.id).reduce((sum, l) => sum + l.value, 0));
  
  const totalLeads = activeLeads.length;

  return (
    <GlassCard className="p-6 w-full overflow-hidden relative">
      <div className="absolute right-0 top-0 w-64 h-64 bg-neon-indigo/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-4">
        <Filter className="text-neon-cyan" size={18} />
        <h3 className="text-md font-display font-semibold text-white">Funil de Vendas Ativo</h3>
        <span className="ml-auto text-xs font-semibold text-gray-400 bg-white/[0.04] px-2.5 py-1 rounded-md">
          {totalLeads} Leads no Pipeline
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 lg:gap-0">
        {stages.map((stage, index) => {
          const count = counts[index];
          const val = values[index];
          const percentageOfTotal = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
          
          return (
            <React.Fragment key={stage.id}>
              {/* Etapa do Funil animada */}
              <motion.div 
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                className="flex-1 min-w-[140px] relative group"
              >
                <div className={clsx(
                  "p-4 rounded-xl border bg-gradient-to-b transition-all duration-300",
                  stage.color, stage.border,
                  "hover:brightness-125"
                )}>
                  <span className={clsx("text-[10px] font-bold uppercase tracking-wider block mb-2", stage.text)}>
                    {stage.label}
                  </span>
                  
                  <div className="flex items-end justify-between">
                    <span className="font-display font-bold text-2xl text-white">
                      {count}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 mb-1">
                      {percentageOfTotal.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.08]">
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Volume</span>
                    <span className="text-xs font-semibold text-gray-200 block mt-0.5">
                      R$ {val.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Seta de Conversão Animada */}
              {index < stages.length - 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: (index * 0.1) + 0.2 }}
                  className="hidden lg:flex items-center justify-center w-8 shrink-0"
                >
                  <ArrowRight className="text-gray-600" size={16} />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Resumo Final */}
      <div className="mt-6 pt-5 border-t border-white/[0.04] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <TrendingUp size={14} className="text-emerald-400" />
          <span>Taxa de Fechamento Geral:</span>
          <strong className="text-white">
            {totalLeads > 0 ? ((counts[4] / totalLeads) * 100).toFixed(1) : 0}%
          </strong>
        </div>
        <div className="text-gray-500">
          * Exclui leads com status "Perdida"
        </div>
      </div>
    </GlassCard>
  );
};
