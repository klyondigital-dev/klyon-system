import React, { useState } from 'react';
import type { Lead, Campaign, Client, Transaction, AutomationFlow, DashboardMetrics, FinancialSummary } from '../types';
import { calculateFinancialSummary } from '../mockData';
import { GlassCard } from '../components/GlassCard';
import { MetricCard } from '../components/MetricCard';
import { DollarSign, Landmark, TrendingUp, TrendingDown, Plus, PlusCircle, Calendar, CreditCard, Tag, Sparkles, Check, X, FileText, Send, Copy } from 'lucide-react';
import clsx from 'clsx';
import { transactionsApi, billingApi } from '../api';

interface FinanceProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  campaigns: Campaign[];
}

export const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, campaigns }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<Transaction['category']>('monthly_fee');
  const [client, setClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');

  // Gestão de Cobranças (Faturas Asaas)
  const [activeFinanceTab, setActiveFinanceTab] = useState<'cashflow' | 'billing'>('cashflow');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invAmount, setInvAmount] = useState<number>(1500);
  const [invDueDate, setInvDueDate] = useState<string>('');
  const [invDesc, setInvDesc] = useState<string>('');
  const [invClientId, setInvClientId] = useState<string>('');

  React.useEffect(() => {
    billingApi.getAll().then(setInvoices).catch(err => console.warn('Falha ao carregar faturas', err));
  }, []);

  const summary = calculateFinancialSummary(transactions, campaigns);

  const getCategoryLabel = (cat: Transaction['category']) => {
    switch (cat) {
      case 'setup_fee': return 'Taxa de Setup';
      case 'monthly_fee': return 'Mensalidade';
      case 'ads_budget': return 'Budget de Anúncios';
      case 'software': return 'Software / SaaS';
      case 'infrastructure': return 'Servidor / Hospedagem';
      case 'commission': return 'Comissão de Vendas';
      default: return 'Outros';
    }
  };

  const getStatusBadge = (stat: Transaction['status']) => {
    if (stat === 'paid') {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Pago</span>;
    }
    return <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">Pendente</span>;
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || amount <= 0) return;

    const newTrans: Omit<Transaction, 'id'> = {
      description: desc,
      amount: Number(amount),
      type,
      category,
      clientName: type === 'income' ? client || 'Cliente Avulso' : undefined,
      date,
      status
    };

    try {
      const saved = await transactionsApi.create(newTrans);
      setTransactions((prev) => [saved, ...prev]);
    } catch (err) {
      console.warn('API Offline ao registrar transação. Atualizando localmente.', err);
      setTransactions((prev) => [{ ...newTrans, id: `t_${Date.now()}` } as Transaction, ...prev]);
    }

    // Reset Form
    setDesc('');
    setAmount(1000);
    setType('income');
    setCategory('monthly_fee');
    setClient('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('paid');
    setModalOpen(false);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientId || !invAmount || !invDueDate) return;

    try {
      const newInv = await billingApi.create({
        clientId: invClientId,
        amount: Number(invAmount),
        dueDate: invDueDate,
        description: invDesc || 'Fee Mensal de Serviços'
      });
      setInvoices(prev => [newInv, ...prev]);
      setInvoiceModalOpen(false);
      setInvAmount(1500);
      setInvDesc('');
    } catch (err) {
      alert('Erro ao gerar cobrança via Asaas. Verifique o console.');
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento Bruto (Entradas)"
          value={summary.grossRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          trend={12.5}
          sparklineData={[9000, 11500, 11000, 12800, 13000, 13000]}
          icon={Landmark}
          accentColor="cyan"
        />
        <MetricCard
          title="Custo de Tráfego Ads"
          value={summary.adSpend.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          trend={4.2}
          sparklineData={[11000, 11500, 12000, 12800, 13100, 13431]}
          icon={TrendingUp}
          accentColor="pink"
        />
        <MetricCard
          title="Lucro Líquido Estimado"
          value={summary.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          trend={15.8}
          sparklineData={[4200, 4800, 4100, 5200, 5600, 6000]}
          icon={DollarSign}
          accentColor="indigo"
        />
        <MetricCard
          title="Margem Operacional"
          value={`${summary.margin.toFixed(1)}%`}
          trend={3.1}
          sparklineData={[38, 41, 39, 42, 43, 44]}
          icon={TrendingDown}
          accentColor="cyan"
        />
      </div>

      {/* CAC & LTV Client metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center justify-between col-span-1" glow>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">CAC Estimado (Mídia)</span>
            <h4 className="text-xl font-display font-bold text-white mt-1">R$ {summary.cac.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h4>
            <span className="text-[9px] text-gray-500 block mt-1">Custo para adquirir cada cliente ativo</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neon-indigo/10 border border-neon-indigo/20 flex items-center justify-center text-neon-indigo">
            <TrendingUp size={18} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between col-span-1" glow>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">LTV Estimado (6 meses)</span>
            <h4 className="text-xl font-display font-bold text-white mt-1">R$ {summary.ltv.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h4>
            <span className="text-[9px] text-gray-500 block mt-1">Faturamento médio acumulado por contrato</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
            <TrendingDown size={18} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between col-span-1" glow>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">LTV / CAC Ratio</span>
            <h4 className="text-xl font-display font-bold text-gradient-purple-cyan mt-1">{(summary.ltv / summary.cac).toFixed(1)}x</h4>
            <span className="text-[9px] text-gray-500 block mt-1">Métrica ideal: acima de 3.0x</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center text-neon-pink">
            <Sparkles size={18} />
          </div>
        </GlassCard>
      </div>

      {/* Tabs Financeiro */}
      <div className="flex items-center gap-2 border-b border-white/[0.04] pb-4">
        <button
          onClick={() => setActiveFinanceTab('cashflow')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
            activeFinanceTab === 'cashflow' ? "bg-white/[0.04] text-white" : "text-gray-500 hover:text-gray-300"
          )}
        >
          <Landmark size={16} /> Fluxo de Caixa (Transações)
        </button>
        <button
          onClick={() => setActiveFinanceTab('billing')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
            activeFinanceTab === 'billing' ? "bg-white/[0.04] text-neon-cyan" : "text-gray-500 hover:text-neon-cyan"
          )}
        >
          <FileText size={16} /> Gestão de Cobranças (Faturas PIX)
        </button>
      </div>

      {activeFinanceTab === 'cashflow' && (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="text-neon-indigo" size={18} />
            <h3 className="text-md font-display font-semibold text-white">Transações e Vendas</h3>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <Plus size={14} /> Registrar Transação
          </button>
        </div>

        {/* Transactions Table Layout */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-surface/50 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Descrição / Cliente</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-6">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 pl-6">
                      <span className="block text-sm font-semibold text-white">{t.description}</span>
                      <span className="text-xs text-gray-500">{t.clientName || 'Klyon Digital'}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-white/[0.01] border border-white/[0.04] px-2 py-0.5 rounded">
                        <Tag size={10} className="text-neon-cyan" /> {getCategoryLabel(t.category)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{t.date}</td>
                    <td className="p-4">{getStatusBadge(t.status)}</td>
                    <td className={clsx(
                      "p-4 text-sm font-semibold text-right pr-6 font-display",
                      t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    )}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* TABA DE COBRANÇAS (ASAAS) */}
      {activeFinanceTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-neon-cyan" size={18} />
              <h3 className="text-md font-display font-semibold text-white">Gestão de Cobranças (Faturas)</h3>
            </div>

            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20 text-xs font-semibold text-neon-cyan transition-colors cursor-pointer shadow-glow-cyan"
            >
              <Plus size={14} /> Nova Cobrança (Pix/Boleto)
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-surface/50 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Descrição / ID</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vencimento</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {invoices.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">Nenhuma fatura gerada ainda.</td></tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6">
                        <span className="block text-sm font-semibold text-white">{inv.description}</span>
                        <span className="text-xs text-gray-500">ID: {inv.asaasId || inv.id}</span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-white">
                        R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        {inv.status === 'RECEIVED' ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Pago</span>
                        ) : inv.status === 'OVERDUE' ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">Atrasado</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">Pendente</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6 space-x-2">
                        {inv.status !== 'RECEIVED' && inv.pixPayload && (
                          <button onClick={() => copyToClipboard(inv.pixPayload!)} className="text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.04] px-3 py-1.5 rounded-lg text-gray-300 transition-colors" title="Copiar PIX Copia e Cola">
                            Copiar PIX
                          </button>
                        )}
                        {inv.invoiceUrl && (
                          <a href={inv.invoiceUrl} target="_blank" rel="noreferrer" className="inline-block text-xs bg-neon-indigo/20 hover:bg-neon-indigo/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors">
                            Ver Fatura
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TRANSACTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          
          <GlassCard className="w-full max-w-md p-6 relative z-10 border border-white/[0.08]" glow>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <PlusCircle className="text-neon-indigo" size={20} />
                <h3 className="text-md font-display font-semibold text-white">Registrar Lançamento Financeiro</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/[0.04] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      setCategory('monthly_fee');
                    }}
                    className={clsx(
                      "py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
                      type === 'income' ? "bg-emerald-500/10 border border-emerald-500/15 text-emerald-400" : "text-gray-500 hover:text-white"
                    )}
                  >
                    Entrada (Venda)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      setCategory('software');
                    }}
                    className={clsx(
                      "py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
                      type === 'expense' ? "bg-rose-500/10 border border-rose-500/15 text-rose-400" : "text-gray-500 hover:text-white"
                    )}
                  >
                    Saída (Despesa)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Descrição *</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={type === 'income' ? "Ex: Mensalidade - AgroForte Insumos" : "Ex: Assinatura Host VPS"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-indigo/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Valor R$ *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 transition-colors cursor-pointer"
                  >
                    {type === 'income' ? (
                      <>
                        <option value="monthly_fee" className="bg-surface">Mensalidade</option>
                        <option value="setup_fee" className="bg-surface">Taxa de Setup</option>
                        <option value="commission" className="bg-surface">Comissão</option>
                        <option value="other" className="bg-surface">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="software" className="bg-surface">Software / SaaS</option>
                        <option value="infrastructure" className="bg-surface">Servidor / Hospedagem</option>
                        <option value="ads_budget" className="bg-surface">Verba de Anúncios</option>
                        <option value="other" className="bg-surface">Outros</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Data Lançamento</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 transition-colors cursor-pointer"
                  >
                    <option value="paid" className="bg-surface">Liquidado (Pago)</option>
                    <option value="pending" className="bg-surface">Aguardando Pagamento</option>
                  </select>
                </div>
              </div>

              {type === 'income' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nome do Cliente</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Ex: Construtora Jácome"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
                >
                  <Check size={14} /> Registrar Transação
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* CREATE INVOICE MODAL (ASAAS) */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => setInvoiceModalOpen(false)}></div>
          
          <GlassCard className="w-full max-w-md p-6 relative z-10 border border-neon-cyan/30" glow>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-blue-500 rounded-t-xl"></div>
            
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <FileText className="text-neon-cyan" size={20} />
                <h3 className="text-md font-display font-semibold text-white">Gerar Cobrança (Asaas)</h3>
              </div>
              <button onClick={() => setInvoiceModalOpen(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/[0.04] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={invClientId}
                  onChange={(e) => setInvClientId(e.target.value)}
                  placeholder="ID do Cliente (ou Nome para este teste)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Descrição na Fatura *</label>
                <input
                  type="text"
                  required
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  placeholder="Ex: Gestão de Tráfego Mês 06"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Valor R$ *</label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3.5 mt-2 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-neon-cyan hover:bg-cyan-400 text-xs font-bold text-black shadow-glow-cyan hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
                >
                  <Send size={14} /> Emitir Fatura PIX
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
