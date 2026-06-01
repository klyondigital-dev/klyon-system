import React, { useState } from 'react';
import type { Client } from '../types';
import { GlassCard } from './GlassCard';
import { X, Building2, CalendarDays, Wallet, Briefcase, Clock, FileText, CheckCircle2, TrendingUp, Settings, Printer, ChevronLeft, KeyRound, QrCode, Plus } from 'lucide-react';
import clsx from 'clsx';
import { billingApi } from '../api';

interface ClientProfileModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ client, onClose }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [isGeneratingAccess, setIsGeneratingAccess] = useState(false);
  const [accessResult, setAccessResult] = useState<{email: string, pass: string} | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const handleGenerateAccess = async () => {
    try {
      setIsGeneratingAccess(true);
      setAccessError(null);
      setAccessResult(null);
      // Calls the newly created endpoint via the fetch wrapper in crmApi or manual fetch if it doesn't exist
      const token = localStorage.getItem('klyon_token');
      const response = await fetch(`http://localhost:3000/api/crm/client/${client.id}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar acesso');
      
      setAccessResult({ email: data.email, pass: data.tempPassword });
    } catch (err: any) {
      setAccessError(err.message);
    } finally {
      setIsGeneratingAccess(false);
    }
  };

  const [isGeneratingPix, setIsGeneratingPix] = useState(false);

  const handleGeneratePix = async () => {
    try {
      setIsGeneratingPix(true);
      const amount = prompt('Valor da cobrança PIX (apenas números):', client.monthlyFee.toString() || '1500');
      if (!amount) return;

      const desc = prompt('Descrição da cobrança:', 'Mensalidade Operacional Klyon');
      if (!desc) return;

      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 3); // vencimento em 3 dias

      await billingApi.create({
        clientId: client.id,
        amount: Number(amount),
        description: desc,
        dueDate: dueDateObj.toISOString().split('T')[0]
      });

      alert('Cobrança gerada com sucesso via Asaas! O cliente já pode ver no Portal VIP dele.');
    } catch (err: any) {
      alert('Erro ao gerar cobrança: ' + err.message);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const handleAddActivity = async () => {
    try {
      setIsAddingActivity(true);
      const title = prompt('Título da ação (ex: Criação de Site, Tráfego Google, etc):');
      if (!title) return;
      
      const type = prompt('Tipo (service / ads / support / setup):', 'service') as any;
      const costStr = prompt('Valor cobrado pelo serviço (Agência) R$: (Deixe 0 se não houver)', '0');
      const adSpendStr = prompt('Valor investido em Anúncios R$: (Deixe 0 se não houver)', '0');

      const newActivity = {
        id: `act-${Date.now()}`,
        title,
        description: 'Registrado manualmente no painel CRM.',
        date: new Date().toISOString(),
        cost: Number(costStr?.replace(',', '.') || 0),
        adSpend: Number(adSpendStr?.replace(',', '.') || 0),
        type: ['service', 'ads', 'support', 'setup'].includes(type) ? type : 'other'
      };

      const updatedHistory = [...(client.activityHistory || []), newActivity];

      // Update backend
      const token = localStorage.getItem('klyon_token');
      await fetch(`http://localhost:3000/api/crm/client/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activityHistory: updatedHistory })
      });

      alert('Ação registrada com sucesso! Ela aparecerá no relatório do cliente ao atualizar a tela.');
    } catch (err: any) {
      alert('Erro ao registrar ação: ' + err.message);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'setup': return <Settings size={14} className="text-blue-400" />;
      case 'ads': return <TrendingUp size={14} className="text-emerald-400" />;
      case 'service': return <Briefcase size={14} className="text-amber-400" />;
      case 'support': return <CheckCircle2 size={14} className="text-purple-400" />;
      default: return <FileText size={14} className="text-gray-400" />;
    }
  };

  // Cálculo de cobrança da fatura
  const monthlyTotal = client.monthlyFee || 0;
  const setupTotal = client.setupFee || 0;
  const services = client.servicesContracted || [];
  const servicesTotal = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const grandTotal = monthlyTotal + setupTotal + servicesTotal;

  if (showInvoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200 print:p-0 print:m-0 print:absolute print:inset-0 print:bg-white print:text-black">
        <div className="fixed inset-0 bg-primary/95 backdrop-blur-md print:hidden" onClick={() => setShowInvoice(false)}></div>
        
        <GlassCard className="w-full max-w-4xl h-full max-h-[90vh] relative z-10 border border-white/[0.08] flex flex-col overflow-hidden bg-surface print:bg-white print:text-black print:border-none print:w-full print:h-full print:max-h-none print:static print:shadow-none" glow>
          {/* Header do visualizador de Fatura (Escondido na Impressão) */}
          <div className="p-5 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01] print:hidden">
            <button 
              onClick={() => setShowInvoice(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer border border-white/[0.04]"
            >
              <ChevronLeft size={14} /> Voltar ao Perfil
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
              >
                <Printer size={14} /> Imprimir / Salvar PDF
              </button>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/[0.04]">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Área da Fatura Corporativa (Modo Impressão Adaptativo) */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface text-gray-100 custom-scrollbar print:bg-white print:text-black print:p-0 print:overflow-visible">
            <div className="max-w-3xl mx-auto space-y-8 bg-surface/50 border border-white/[0.03] p-8 md:p-10 rounded-2xl print:border-none print:bg-white print:text-black print:p-0">
              
              {/* Logo e Cabeçalho Corporativo */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-white/[0.05] pb-8 print:border-black/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-neon-indigo to-neon-cyan flex items-center justify-center font-display font-bold text-white shadow-glow-indigo text-md print:bg-black print:text-white print:shadow-none">
                      K
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-white print:text-black">
                      Klyon <span className="text-neon-cyan print:text-black font-semibold text-sm">DIGITAL</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium print:text-gray-600">
                    Klyon Negócios Digitais LTDA • CNPJ: 45.129.063/0001-00<br />
                    Alameda das Américas, 1200 - São Paulo, SP • contato@klyon.digital
                  </div>
                </div>
                
                <div className="text-left sm:text-right space-y-1">
                  <h1 className="text-lg font-display font-bold uppercase tracking-widest text-gradient-purple-cyan print:text-black print:bg-none">Fatura / Recibo</h1>
                  <div className="text-xs text-gray-400 print:text-gray-600">Fatura Nª: <strong className="text-white print:text-black font-bold">#FT-{Date.now().toString().slice(-6)}</strong></div>
                  <div className="text-xs text-gray-400 print:text-gray-600">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                  <div className="text-xs text-gray-400 print:text-gray-600">Vencimento: À Vista (Pix)</div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/[0.01] border border-white/[0.03] p-5 rounded-xl print:border-black/10 print:bg-transparent print:p-0 print:rounded-none">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Destinatário</span>
                  <div className="text-sm font-bold text-white print:text-black">{client.company}</div>
                  <div className="text-xs text-gray-400 print:text-gray-600 mt-1">
                    Responsável: {client.name}<br />
                    E-mail: {client.email}<br />
                    Telefone: {client.phone}
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Detalhes do Contrato</span>
                  <div className="text-xs text-gray-400 print:text-gray-600">
                    Status: <strong className="text-emerald-400 print:text-emerald-600 uppercase">Ativo</strong><br />
                    Início do Contrato: {client.contractStartDate}<br />
                    Budget Mídia sob Gestão: R$ {(client.adSpendBudget || 0).toLocaleString('pt-BR')}/mês
                  </div>
                </div>
              </div>

              {/* Tabela de Lançamentos Cobrados */}
              <div className="space-y-3">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Serviços e Honorários Relacionados</span>
                <div className="overflow-hidden rounded-xl border border-white/[0.04] bg-black/10 print:border-black/15 print:bg-transparent">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[9px] font-bold text-gray-500 uppercase tracking-wider print:border-black/10 print:text-black">
                        <th className="p-3.5 pl-5">Item / Descrição</th>
                        <th className="p-3.5">Frequência</th>
                        <th className="p-3.5 text-right pr-5">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] text-gray-300 print:divide-black/5 print:text-black">
                      {monthlyTotal > 0 && (
                        <tr>
                          <td className="p-3.5 pl-5 font-semibold">Mensalidade Operacional - Gestão de Tráfego & CRM</td>
                          <td className="p-3.5">Mensal</td>
                          <td className="p-3.5 text-right pr-5 font-semibold">R$ {monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      {setupTotal > 0 && (
                        <tr>
                          <td className="p-3.5 pl-5 font-semibold">Taxa Única de Setup e Integração Comercial</td>
                          <td className="p-3.5">Única (Paga)</td>
                          <td className="p-3.5 text-right pr-5 font-semibold">R$ {setupTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td className="p-3.5 pl-5 font-semibold">{service.name}</td>
                          <td className="p-3.5">Avulso</td>
                          <td className="p-3.5 text-right pr-5 font-semibold">R$ {(service.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totalizador */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/[0.03] p-5 rounded-xl print:border-black/10 print:bg-transparent print:p-0">
                <div className="text-xs text-gray-500 print:text-gray-600 leading-relaxed max-w-sm">
                  <strong>Método de Pagamento Preferencial:</strong> Transferência Instantânea (Pix).<br />
                  Chave Pix CNPJ: <strong>45.129.063/0001-00</strong> (Klyon Negócios Digitais).
                </div>
                
                <div className="text-right self-stretch sm:self-auto space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Valor Total do Recibo</span>
                  <div className="text-2xl font-display font-bold text-neon-cyan print:text-black">
                    R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded print:text-emerald-600 print:border-emerald-600/20">
                    ✓ Liquidado e Pago
                  </span>
                </div>
              </div>

              {/* Nota de rodapé corporativa */}
              <div className="border-t border-white/[0.05] pt-6 text-center text-[9px] text-gray-500 print:border-black/10 print:text-gray-600 leading-relaxed">
                Este documento é uma representação de cobrança e recibo oficial de serviços digitais prestados pela Klyon Digital.<br />
                Agradecemos pela parceria comercial. Juntos rumo à alta escala!
              </div>

            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-primary/90 backdrop-blur-md" onClick={onClose}></div>
      
      <GlassCard className="w-full max-w-6xl h-full max-h-[90vh] relative z-10 border border-white/[0.08] flex flex-col overflow-hidden" glow>
        
        {/* Header Exclusivo */}
        <div className="p-6 md:p-8 border-b border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-indigo/20 to-neon-cyan/20 border border-white/[0.08] flex items-center justify-center">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">{client.company}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {client.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                Responsável: <strong className="text-gray-200">{client.name}</strong> • {client.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowInvoice(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-indigo/20 text-neon-indigo hover:bg-neon-indigo/30 transition-all cursor-pointer text-xs font-semibold border border-neon-indigo/35 hover:translate-y-[-1px] active:translate-y-0"
            >
              <Printer size={14} /> Recibo PDF
            </button>

            <button 
              onClick={handleGeneratePix}
              disabled={isGeneratingPix}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer text-xs font-semibold border border-emerald-500/35 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50"
            >
              <QrCode size={14} /> {isGeneratingPix ? 'Gerando...' : 'Cobrar PIX'}
            </button>

            <button 
              onClick={handleGenerateAccess}
              disabled={isGeneratingAccess}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-all cursor-pointer text-xs font-semibold border border-neon-cyan/35 hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-50"
            >
              <KeyRound size={14} /> {isGeneratingAccess ? 'Gerando...' : 'Gerar Acesso'}
            </button>
            
            <div className="text-right border-l border-white/[0.08] pl-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1 flex items-center gap-1.5 justify-end">
                <CalendarDays size={12} /> Vigência de Contrato
              </span>
              <div className="text-sm font-semibold text-white">
                {client.contractStartDate} <span className="text-gray-600 mx-1">→</span> {client.contractEndDate || 'Indeterminado'}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/[0.04]">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {/* Alertas de Geração de Acesso */}
          {accessError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              ⚠️ {accessError}
            </div>
          )}
          {accessResult && (
            <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <strong className="block text-emerald-300 mb-2">✅ Acesso criado com sucesso!</strong>
              Envie estes dados para o cliente:<br/>
              <strong>Link:</strong> seu-dominio.com.br/login<br/>
              <strong>Email:</strong> {accessResult.email}<br/>
              <strong>Senha Temporária:</strong> <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-white">{accessResult.pass}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Coluna Esquerda: Finanças e Serviços (2/3 da tela) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Módulo Financeiro: Agência vs Ads */}
              <div>
                <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Wallet size={16} className="text-neon-cyan" /> Balanço Financeiro Acumulado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-neon-indigo/10 to-transparent border border-neon-indigo/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-neon-indigo/10 rounded-full blur-2xl group-hover:bg-neon-indigo/20 transition-all"></div>
                    <span className="text-xs font-semibold text-indigo-400 block mb-2 relative z-10">Receita Bruta da Klyon</span>
                    <span className="font-display font-bold text-3xl text-white block relative z-10">
                      R$ {(client.totalAgencySpend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-2 block relative z-10">Total pago em serviços e fees.</span>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <span className="text-xs font-semibold text-emerald-400 block mb-2 relative z-10">Investido no Meta/Google</span>
                    <span className="font-display font-bold text-3xl text-white block relative z-10">
                      R$ {(client.totalAdSpend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-2 block relative z-10">Orçamento injetado em anúncios.</span>
                  </div>
                </div>
              </div>

              {/* Módulo de Serviços Contratados */}
              <div>
                <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-neon-indigo" /> Serviços Contratados
                </h3>
                <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-[10px] text-gray-500 uppercase tracking-wider bg-black/20">
                        <th className="p-4 pl-6">Serviço / Produto</th>
                        <th className="p-4">Data Contratação</th>
                        <th className="p-4 text-right pr-6">Valor R$</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6 font-semibold text-sm text-gray-200">{service.name}</td>
                          <td className="p-4 text-xs text-gray-400">{service.date}</td>
                          <td className="p-4 text-sm font-bold text-white text-right pr-6">
                            {(service.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!client.servicesContracted || client.servicesContracted.length === 0) && (
                    <div className="p-6 text-center text-gray-500 text-xs italic">Nenhum serviço avulso registrado.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Coluna Direita: Timeline de Atividades (1/3 da tela) */}
            <div className="lg:col-span-1 border-l border-white/[0.04] lg:pl-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                  <Clock size={16} className="text-neon-pink" /> Histórico & Ações
                </h3>
                <button
                  onClick={handleAddActivity}
                  disabled={isAddingActivity}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-pink/10 hover:bg-neon-pink/20 text-neon-pink transition-colors text-xs font-semibold border border-neon-pink/20 disabled:opacity-50"
                >
                  <Plus size={14} /> Registrar
                </button>
              </div>
              
              <div className="relative border-l-2 border-white/[0.04] ml-3 space-y-6 pb-6">
                {(client.activityHistory || []).map((act, index) => (
                  <div key={act.id} className="relative pl-6">
                    {/* Indicador Bolinha */}
                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-[#0e0e14] border border-white/[0.1] flex items-center justify-center shadow-lg">
                      {getActivityIcon(act.type)}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                      <span className="text-[10px] font-bold text-gray-500 block mb-1 tracking-wider">
                        {new Date(act.date).toLocaleDateString('pt-BR')}
                      </span>
                      <strong className="text-xs text-white block mb-0.5">{act.title}</strong>
                      <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{act.description}</p>
                      
                      {(act.cost > 0 || act.adSpend > 0) && (
                        <div className="flex gap-2 mt-2 pt-2 border-t border-white/[0.05]">
                          {act.cost > 0 && (
                            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              Agência: R$ {act.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          {act.adSpend > 0 && (
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Ads: R$ {act.adSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!client.activityHistory || client.activityHistory.length === 0) && (
                  <div className="pl-6 text-gray-500 text-xs italic">
                    Nenhuma atividade registrada ainda.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </GlassCard>
    </div>
  );
};
