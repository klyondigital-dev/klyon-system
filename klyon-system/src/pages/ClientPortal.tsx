import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import type { Lead, Campaign, Transaction, Client } from '../types';
import { Target, TrendingUp, Users, DollarSign, Activity, FileDown, LayoutDashboard, Wallet, CheckCircle2, CircleDashed, Phone, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { billingApi } from '../api';

interface ClientPortalProps {
  currentUser: { name: string; email: string; role: string; clientId?: string };
  clients: Client[];
  campaigns: Campaign[];
  leads: Lead[];
  transactions: Transaction[];
  onLogout: () => void;
}

type TabType = 'overview' | 'leads' | 'finance' | 'reports';

export const ClientPortal: React.FC<ClientPortalProps> = ({ currentUser, clients, campaigns, leads, transactions, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [invoices, setInvoices] = useState<any[]>([]);

  React.useEffect(() => {
    billingApi.getAll().then(setInvoices).catch(console.error);
  }, []);

  // O backend já filtrou e retornou apenas os dados DESTE cliente específico
  const myClientData = clients.length > 0 ? clients[0] : null;

  // Cálculos Overview
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const totalRevenue = leads.filter(l => l.status === 'won').reduce((acc, l) => acc + l.value, 0);
  
  const cpa = totalLeads > 0 ? totalSpent / totalLeads : 0;
  const roi = totalSpent > 0 ? (totalRevenue - totalSpent) / totalSpent : 0;

  // Gerar dados reais para o gráfico (últimos 7 dias de leads gerados)
  const realChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const leadsForDate = leads.filter(l => l.createdAt.startsWith(dateStr)).length;
      
      // Para simular o gasto diário de forma simples (dividindo o total pelo número de dias, ou usando os leads)
      // Como não temos a data do gasto no objeto de campaign de forma diária, vamos usar um mock proporcional aos leads para fins de visualização do cliente
      const spentProxy = leadsForDate * (cpa > 0 ? cpa : 15);

      data.push({
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        fullDate: dateStr,
        leads: leadsForDate,
        spent: spentProxy
      });
    }
    return data;
  }, [leads, cpa]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-primary text-gray-100 flex flex-col">
      {/* Client Header */}
      <header className="h-16 border-b border-white/[0.05] bg-black/40 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-indigo to-neon-cyan flex items-center justify-center font-bold text-white shadow-glow-indigo">
            {myClientData?.company?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-sm font-bold font-display tracking-wide">{myClientData?.company || 'Meu Painel'}</h1>
            <p className="text-[10px] text-gray-400">Portal do Cliente VIP</p>
          </div>
        </div>
        <div className="flex items-center gap-4 no-print">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-semibold text-white">{currentUser.name}</span>
            <span className="block text-[10px] text-gray-500">{currentUser.email}</span>
          </div>
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.1] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors border border-white/[0.05]"
          >
            <FileDown size={14} />
            Exportar PDF
          </button>
          <button onClick={onLogout} className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg font-semibold transition-colors">
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print-area">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Olá, {currentUser.name.split(' ')[0]}! 👋</h2>
            <p className="text-gray-400 mt-1 text-sm">Acompanhe os resultados da sua assessoria de marketing e vendas em tempo real.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.04] pb-px no-print">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'overview' ? "border-neon-indigo text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <LayoutDashboard size={16} /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={clsx(
              "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'leads' ? "border-neon-cyan text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <Users size={16} /> Meus Leads
            <span className={clsx("ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold", activeTab === 'leads' ? "bg-neon-cyan/20 text-neon-cyan" : "bg-white/[0.05] text-gray-500")}>
              {leads.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={clsx(
              "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'finance' ? "border-emerald-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <Wallet size={16} /> Financeiro
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={clsx(
              "px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === 'reports' ? "border-neon-pink text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <FileDown size={16} /> Meus Relatórios
          </button>
        </div>

        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <FileDown className="text-neon-pink" /> Relatórios de Desempenho e Ações
              </h3>
            </div>

            {(!myClientData?.activityHistory || myClientData.activityHistory.length === 0) ? (
              <GlassCard className="p-12 text-center flex flex-col items-center justify-center" glow>
                <CircleDashed size={48} className="text-white/[0.05] mb-4" />
                <h4 className="text-gray-300 font-semibold mb-1">Nenhum relatório disponível ainda</h4>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  A agência ainda não publicou os relatórios mensais de desempenho para sua conta.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-8">
                {/* Agrupar histórico por Mês/Ano */}
                {Object.entries(
                  myClientData.activityHistory.reduce((acc: any, act: any) => {
                    const date = new Date(act.date);
                    const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                    const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(act);
                    return acc;
                  }, {})
                ).reverse().map(([monthYear, acts]: [string, any]) => {
                  
                  const totalAdSpend = acts.reduce((sum: number, a: any) => sum + (a.adSpend || 0), 0);
                  const totalCost = acts.reduce((sum: number, a: any) => sum + (a.cost || 0), 0);

                  return (
                    <GlassCard key={monthYear} className="overflow-hidden border border-white/[0.08]" glow>
                      <div className="bg-gradient-to-r from-neon-pink/10 to-transparent p-6 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neon-pink mb-1 block">Relatório Consolidado</span>
                          <h4 className="text-2xl font-display font-bold text-white">{monthYear}</h4>
                        </div>
                        <button onClick={() => window.print()} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold rounded-lg flex items-center gap-2 border border-white/[0.1] transition-colors self-start sm:self-auto cursor-pointer">
                          <Printer size={14} /> Imprimir / PDF
                        </button>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="bg-black/20 rounded-xl p-4 border border-white/[0.03]">
                            <span className="text-xs text-gray-500 block mb-1">Verba Injetada (Anúncios)</span>
                            <strong className="text-xl text-emerald-400">R$ {totalAdSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </div>
                          <div className="bg-black/20 rounded-xl p-4 border border-white/[0.03]">
                            <span className="text-xs text-gray-500 block mb-1">Serviços da Agência (Custo)</span>
                            <strong className="text-xl text-indigo-400">R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </div>
                        </div>

                        <h5 className="text-sm font-semibold text-gray-300 mb-4 border-b border-white/[0.05] pb-2">Ações e Entregas Realizadas</h5>
                        <div className="space-y-4">
                          {acts.map((act: any) => (
                            <div key={act.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 bg-white/[0.01] p-4 rounded-xl border border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                              <div>
                                <strong className="text-gray-100 text-sm block">{act.title}</strong>
                                <span className="text-xs text-gray-500 block mt-1">{act.description}</span>
                              </div>
                              <div className="text-left sm:text-right sm:min-w-[120px] mt-2 sm:mt-0">
                                <span className="text-[10px] text-gray-500 font-bold tracking-wider block mb-1">{new Date(act.date).toLocaleDateString('pt-BR')}</span>
                                {act.adSpend > 0 && <span className="text-xs text-emerald-400 block">Ads: R$ {act.adSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
                                {act.cost > 0 && <span className="text-xs text-indigo-400 block">Agência: R$ {act.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-5 flex flex-col" glow>
                <div className="flex items-center gap-2 text-neon-indigo mb-2">
                  <DollarSign size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Investimento Pago</span>
                </div>
                <span className="text-2xl font-bold font-display text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                </span>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col">
                <div className="flex items-center gap-2 text-neon-cyan mb-2">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Oportunidades (Leads)</span>
                </div>
                <span className="text-2xl font-bold font-display text-white">{totalLeads}</span>
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">Custo por Lead: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cpa)}</span>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Target size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Vendas Concluídas</span>
                </div>
                <span className="text-2xl font-bold font-display text-white">{wonLeads}</span>
                <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">Fechamentos registrados</span>
              </GlassCard>

              <GlassCard className="p-5 flex flex-col" glow>
                <div className="flex items-center gap-2 text-neon-pink mb-2">
                  <TrendingUp size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Retorno (ROAS)</span>
                </div>
                <span className="text-2xl font-bold font-display text-white">{(roi * 100).toFixed(1)}%</span>
                <span className="text-[10px] text-gray-400 mt-1">Estimado sobre vendas</span>
              </GlassCard>
            </div>

            {/* Chart Section */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={18} className="text-neon-cyan" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Volume de Leads nos Últimos 7 Dias</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="leads" name="Oportunidades Geradas" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB: LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <GlassCard className="p-1 border border-white/[0.04]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-bold">Data</th>
                      <th className="p-4 font-bold">Nome / Oportunidade</th>
                      <th className="p-4 font-bold">Contato</th>
                      <th className="p-4 font-bold">Status Comercial</th>
                      <th className="p-4 font-bold text-right">Valor Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/[0.02]">
                    {leads.length > 0 ? leads.map(lead => {
                      const dateObj = new Date(lead.createdAt);
                      const isRecent = (new Date().getTime() - dateObj.getTime()) < 48 * 60 * 60 * 1000;
                      
                      return (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4 text-gray-400 text-xs">
                          {dateObj.toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white flex items-center gap-2">
                            {lead.name}
                            {isRecent && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>}
                          </div>
                          {lead.company && <div className="text-[10px] text-gray-500 mt-0.5">{lead.company}</div>}
                        </td>
                        <td className="p-4 text-gray-300">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone size={12} className="text-gray-500" />
                            {lead.phone || 'Não informado'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={clsx(
                            "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase inline-flex items-center gap-1.5",
                            lead.status === 'new' ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' :
                            lead.status === 'contacted' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            lead.status === 'qualified' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            lead.status === 'proposal' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            lead.status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-white/[0.05] text-gray-400 border border-white/[0.05]'
                          )}>
                            {lead.status === 'won' ? <CheckCircle2 size={10} /> : <CircleDashed size={10} />}
                            {lead.status === 'new' ? 'Novo Lead' :
                             lead.status === 'contacted' ? 'Em Contato' :
                             lead.status === 'qualified' ? 'Qualificado' :
                             lead.status === 'proposal' ? 'Proposta' :
                             lead.status === 'won' ? 'Venda Fechada' : 'Perdido'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-display text-neon-cyan text-sm">
                          {lead.value > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value) : '-'}
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500 text-sm italic">
                          Nenhum lead captado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB: FINANCE */}
        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <GlassCard className="p-6 border border-white/[0.04]">
              <h3 className="text-md font-display font-semibold text-white mb-6">Suas Faturas</h3>
              <div className="space-y-4">
                {invoices.length > 0 ? invoices.map(inv => (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        inv.status === 'RECEIVED' ? "bg-emerald-500/10 text-emerald-400" :
                        inv.status === 'PENDING' ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-rose-500/10 text-rose-400"
                      )}>
                        <Wallet size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{inv.description}</h4>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mt-0.5">Vencimento: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-6 sm:w-1/2">
                      <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block">
                        <span className="block text-lg font-display font-bold text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount)}
                        </span>
                        <span className={clsx(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block sm:mt-1",
                          inv.status === 'RECEIVED' ? "text-emerald-400 bg-emerald-500/10" :
                          inv.status === 'PENDING' ? "text-yellow-400 bg-yellow-500/10" :
                          "text-rose-400 bg-rose-500/10"
                        )}>
                          {inv.status === 'RECEIVED' ? 'Pago' : inv.status === 'PENDING' ? 'Aguardando Pagamento' : 'Atrasado'}
                        </span>
                      </div>
                      
                      {inv.status !== 'RECEIVED' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          {inv.pixPayload && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(inv.pixPayload);
                                alert('PIX Copia e Cola transferido para a área de transferência!');
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-neon-indigo to-neon-cyan text-white text-xs font-bold rounded-lg shadow-glow-indigo cursor-pointer hover:opacity-90 whitespace-nowrap flex-1 sm:flex-none text-center"
                            >
                              Copiar PIX
                            </button>
                          )}
                          {inv.invoiceUrl && (
                            <a 
                              href={inv.invoiceUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 bg-white/[0.05] border border-white/[0.1] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-white/[0.1] whitespace-nowrap flex-1 sm:flex-none text-center"
                            >
                              Ver Boleto
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500 text-sm">Nenhuma fatura encontrada.</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

      </main>
    </div>
  );
};
