import React, { useState, useMemo } from 'react';
import type { Lead, Campaign, Client, Transaction, AutomationFlow, DashboardMetrics, FinancialSummary } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Kanban, List, Plus, Search, Filter, Phone, Mail, ChevronRight, ChevronLeft, Trash2, X, PlusCircle, Check, Briefcase, Landmark, TrendingUp, Building2 } from 'lucide-react';
import clsx from 'clsx';
import { SalesFunnelChart } from '../components/SalesFunnelChart';
import { ClientProfileModal } from '../components/ClientProfileModal';
import { leadsApi, clientsApi, transactionsApi } from '../api';

const getLeadScore = (lead: Lead) => {
  let score = 0;
  
  if (lead.value > 8000) score += 40;
  else if (lead.value > 4000) score += 25;
  else score += 10;
  
  if (lead.status === 'proposal' || lead.status === 'qualified') score += 40;
  else if (lead.status === 'contacted') score += 20;
  else if (lead.status === 'won') score += 60;
  else score += 5;
  
  if (lead.source === 'referral') score += 20;
  else if (lead.source === 'organic') score += 15;
  else score += 10;
  
  if (score >= 75) return { label: '🔥 Quente', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  if (score >= 45) return { label: '⚡ Morno', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  return { label: '❄️ Frio', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
};

interface LeadsCRMProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

type MainTab = 'leads' | 'clients';
type ViewMode = 'kanban' | 'list';

export const LeadsCRM: React.FC<LeadsCRMProps> = ({ leads, setLeads, clients, setClients, setTransactions }) => {
  const [mainTab, setMainTab] = useState<MainTab>('leads');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [nicheFilter, setNicheFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Modals States
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = useState<Client | null>(null);

  // New Lead fields
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadValue, setNewLeadValue] = useState(5000);
  const [newLeadSource, setNewLeadSource] = useState<'meta' | 'google' | 'organic' | 'referral'>('meta');
  const [newLeadNiche, setNewLeadNiche] = useState('');
  const [newLeadCity, setNewLeadCity] = useState('');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // New Client fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientMonthly, setNewClientMonthly] = useState(2500);
  const [newClientSetup, setNewClientSetup] = useState(3000);
  const [newClientBudget, setNewClientBudget] = useState(5000);
  const [newClientNiche, setNewClientNiche] = useState('');
  const [newClientCity, setNewClientCity] = useState('');

  // Derived Data for Filters (Memoized)
  const allNiches = useMemo(() => Array.from(new Set([
    ...leads.map(l => l.niche),
    ...clients.map(c => c.niche)
  ])).filter(Boolean) as string[], [leads, clients]);

  const allCities = useMemo(() => Array.from(new Set([
    ...leads.map(l => l.city),
    ...clients.map(c => c.city)
  ])).filter(Boolean) as string[], [leads, clients]);

  // Filter prospects (leads)
  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchLow) ||
      lead.company.toLowerCase().includes(searchLow) ||
      lead.email.toLowerCase().includes(searchLow);
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesNiche = nicheFilter === 'all' || lead.niche === nicheFilter;
    const matchesCity = cityFilter === 'all' || lead.city === cityFilter;
    return matchesSearch && matchesSource && matchesNiche && matchesCity;
  }), [leads, searchQuery, sourceFilter, nicheFilter, cityFilter]);

  // Filter clients
  const filteredClients = useMemo(() => clients.filter((client) => {
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch = 
      client.name.toLowerCase().includes(searchLow) ||
      client.company.toLowerCase().includes(searchLow) ||
      client.email.toLowerCase().includes(searchLow);
    const matchesNiche = nicheFilter === 'all' || client.niche === nicheFilter;
    const matchesCity = cityFilter === 'all' || client.city === cityFilter;
    return matchesSearch && matchesNiche && matchesCity;
  }), [clients, searchQuery, nicheFilter, cityFilter]);

  const isColdLead = (dateStr: string, status: string) => {
    if (status === 'won' || status === 'lost') return false;
    const leadDate = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (now - leadDate) / (1000 * 3600 * 24);
    return diffDays > 30;
  };

  const crmStatuses: { id: Lead['status']; label: string; color: string; border: string; bg: string }[] = [
    { id: 'new', label: 'Sem Contato', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
    { id: 'contacted', label: 'Contatado', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    { id: 'qualified', label: 'Qualificado', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
    { id: 'proposal', label: 'Proposta', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
    { id: 'won', label: 'Ganha (Contrato)', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    { id: 'lost', label: 'Perdida', color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5' },
  ];

  const promoteLeadToClient = async (lead: Lead) => {
    // Check if already a client
    const alreadyClient = clients.some(c => c.company.toLowerCase() === lead.company.toLowerCase());
    if (alreadyClient) return;

    const newCli: Client = {
      id: `cli_${Date.now()}_${lead.id}`,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      niche: lead.niche,
      city: lead.city,
      monthlyFee: 2500, // fee padrão simulado
      setupFee: lead.value || 3000,
      activeCampaignsCount: 1,
      adSpendBudget: 5000,
      status: 'active',
      contractStartDate: new Date().toISOString().split('T')[0],
      activityHistory: []
    };

    const newTrans: Transaction = {
      id: `t_won_${Date.now()}`,
      description: `Setup Fee - Contrato Ganho (${lead.company})`,
      amount: lead.value || 3000,
      type: 'income',
      category: 'setup_fee',
      clientName: lead.company,
      date: new Date().toISOString().split('T')[0],
      status: 'paid'
    };

    try {
      const cliPayload = { ...newCli };
      delete (cliPayload as any).id;
      const transPayload = { ...newTrans };
      delete (transPayload as any).id;
      
      const savedCli = await clientsApi.create(cliPayload as Omit<Client, 'id'>);
      const savedTrans = await transactionsApi.create(transPayload as Omit<Transaction, 'id'>);
      setClients(prev => [savedCli, ...prev]);
      if (setTransactions) setTransactions(prev => [savedTrans, ...prev]);
    } catch (apiErr) {
      console.warn('API offline ao promover lead a cliente. Usando fallback local.', apiErr);
      setClients(prev => [newCli, ...prev]);
      if (setTransactions) setTransactions(prev => [newTrans, ...prev]);
    }
  };

  const moveLeadStatus = async (leadId: string, direction: 'forward' | 'backward') => {
    const statusSequence: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const currentIndex = statusSequence.indexOf(lead.status);
    let nextIndex = currentIndex;
    if (direction === 'forward' && currentIndex < statusSequence.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }
    const newStatus = statusSequence[nextIndex];

    try {
      const updated = await leadsApi.update(leadId, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (newStatus === 'won') promoteLeadToClient(updated);
    } catch (err) {
      console.warn('API Offline. Atualizando localmente.', err);
      const updatedLocal = { ...lead, status: newStatus };
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLocal : l)));
      if (newStatus === 'won') promoteLeadToClient(updatedLocal);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    try {
      const updated = await leadsApi.update(leadId, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (newStatus === 'won') promoteLeadToClient(updated);
    } catch (err) {
      console.warn('API Offline. Atualizando localmente.', err);
      const updatedLocal = { ...lead, status: newStatus };
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLocal : l)));
      if (newStatus === 'won') promoteLeadToClient(updatedLocal);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (window.confirm('Deseja realmente remover este lead?')) {
      try {
        await leadsApi.delete(leadId);
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      } catch (err) {
        console.warn('API Offline. Removendo localmente.', err);
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      }
    }
  };

  const deleteClient = async (clientId: string) => {
    if (window.confirm('Deseja realmente cancelar este contrato de cliente?')) {
      try {
        await clientsApi.delete(clientId);
        setClients((prev) => prev.filter((c) => c.id !== clientId));
      } catch (err) {
        console.warn('API Offline. Removendo localmente.', err);
        setClients((prev) => prev.filter((c) => c.id !== clientId));
      }
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    const newLead: Omit<Lead, 'id'> = {
      name: newLeadName,
      email: newLeadEmail || 'contato@' + newLeadCompany.toLowerCase().replace(/\s+/g, '') + '.com.br',
      phone: newLeadPhone || '(11) 99999-9999',
      status: 'new',
      value: Number(newLeadValue),
      company: newLeadCompany,
      date: new Date().toISOString().split('T')[0],
      source: newLeadSource,
      niche: newLeadNiche,
      city: newLeadCity,
      notes: newLeadNotes || 'Novo lead cadastrado manualmente.'
    };

    try {
      const saved = await leadsApi.create(newLead);
      setLeads((prev) => [saved, ...prev]);
    } catch (err) {
      console.warn('API Offline. Criando localmente com fallback ID.', err);
      setLeads((prev) => [{ ...newLead, id: `l_${Date.now()}` } as Lead, ...prev]);
    }

    setLeadModalOpen(false);
    
    // Reset Form
    setNewLeadName('');
    setNewLeadEmail('');
    setNewLeadPhone('');
    setNewLeadCompany('');
    setNewLeadValue(5000);
    setNewLeadSource('meta');
    setNewLeadNiche('');
    setNewLeadCity('');
    setNewLeadNotes('');
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientCompany) return;

    const newCli: Omit<Client, 'id'> = {
      name: newClientName,
      company: newClientCompany,
      email: newClientEmail || 'financeiro@' + newClientCompany.toLowerCase().replace(/\s+/g, '') + '.com.br',
      phone: newClientPhone || '(11) 99999-9999',
      niche: newClientNiche,
      city: newClientCity,
      monthlyFee: Number(newClientMonthly),
      setupFee: Number(newClientSetup),
      activeCampaignsCount: 1,
      adSpendBudget: Number(newClientBudget),
      status: 'active',
      contractStartDate: new Date().toISOString().split('T')[0],
      totalAdSpend: 0,
      totalAgencySpend: Number(newClientSetup),
      servicesContracted: [],
      activityHistory: [
        {
          id: `p_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: 'Setup',
          description: 'Contrato cadastrado manualmente no sistema.',
          cost: 0,
          adSpend: 0,
          type: 'other'
        }
      ]
    };

    try {
      const saved = await clientsApi.create(newCli);
      setClients((prev) => [saved, ...prev]);
    } catch (err) {
      console.warn('API Offline. Criando cliente localmente com fallback ID.', err);
      setClients((prev) => [{ ...newCli, id: `cli_${Date.now()}` } as Client, ...prev]);
    }

    setClientModalOpen(false);

    // Reset Form
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientMonthly(2500);
    setNewClientSetup(3000);
    setNewClientBudget(5000);
    setNewClientNiche('');
    setNewClientCity('');
  };

  const getSourceBadge = (source: Lead['source']) => {
    switch (source) {
      case 'meta':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 border border-blue-500/15 text-blue-400">Meta Ads</span>;
      case 'google':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/15 text-emerald-400">Google Ads</span>;
      case 'referral':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 border border-purple-500/15 text-purple-400">Indicação</span>;
      case 'organic':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-500/10 border border-gray-500/15 text-gray-400">Orgânico</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Modern Tab Switcher */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-md">
          <button
            onClick={() => setMainTab('leads')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-sm font-semibold transition-all cursor-pointer",
              mainTab === 'leads'
                ? "bg-gradient-to-r from-neon-indigo/20 to-neon-cyan/20 text-white shadow-lg border border-white/[0.08]"
                : "text-gray-500 hover:text-gray-300 transparent border border-transparent"
            )}
          >
            <Kanban size={16} /> Funil de Vendas (Prospects)
          </button>
          <button
            onClick={() => setMainTab('clients')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-sm font-semibold transition-all cursor-pointer",
              mainTab === 'clients'
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white shadow-lg border border-white/[0.08]"
                : "text-gray-500 hover:text-gray-300 transparent border border-transparent"
            )}
          >
            <Briefcase size={16} /> Carteira de Clientes
            <span className={clsx("ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold", mainTab === 'clients' ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.05] text-gray-500")}>
              {clients.length}
            </span>
          </button>
        </div>
      </div>

      {/* FILTER & HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder={mainTab === 'leads' ? "Buscar leads..." : "Buscar clientes ativos..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-indigo/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="text-gray-500" size={16} />
            {mainTab === 'leads' && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 transition-colors"
              >
                <option value="all" className="bg-surface">Todos os Canais</option>
                <option value="meta" className="bg-surface">Meta Ads</option>
                <option value="google" className="bg-surface">Google Ads</option>
                <option value="organic" className="bg-surface">Orgânico</option>
                <option value="referral" className="bg-surface">Indicação</option>
              </select>
            )}
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 transition-colors"
            >
              <option value="all" className="bg-surface">Todos os Tipos</option>
              {allNiches.map(niche => (
                <option key={niche} value={niche} className="bg-surface">{niche}</option>
              ))}
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 transition-colors"
            >
              <option value="all" className="bg-surface">Todas as Cidades</option>
              {allCities.map(city => (
                <option key={city} value={city} className="bg-surface">{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {mainTab === 'leads' && (
            <div className="flex rounded-lg bg-white/[0.02] border border-white/[0.04] p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={clsx(
                  "p-2 rounded-md transition-colors cursor-pointer",
                  viewMode === 'kanban' ? "bg-white/[0.06] text-white" : "text-gray-500 hover:text-white"
                )}
              >
                <Kanban size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2 rounded-md transition-colors cursor-pointer",
                  viewMode === 'list' ? "bg-white/[0.06] text-white" : "text-gray-500 hover:text-white"
                )}
              >
                <List size={16} />
              </button>
            </div>
          )}

          {mainTab === 'leads' ? (
            <button
              onClick={() => setLeadModalOpen(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
            >
              <Plus size={16} /> Criar Lead
            </button>
          ) : (
            <button
              onClick={() => setClientModalOpen(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo hover:translate-y-[-1px] active:translate-y-0 transition-all cursor-pointer"
            >
              <Plus size={16} /> Novo Contrato Cliente
            </button>
          )}
        </div>
      </div>

      {/* LEADS TAB CONTENT */}
      {mainTab === 'leads' && (
        <>
          <div className="mb-6">
            <SalesFunnelChart leads={filteredLeads} />
          </div>
          
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {crmStatuses.map((column) => {
                const columnLeads = filteredLeads.filter((l) => l.status === column.id);
                const totalValue = columnLeads.reduce((sum, l) => sum + l.value, 0);

                return (
                  <div key={column.id} className="flex flex-col min-w-[250px] lg:min-w-[200px] shrink-0">
                    <div className={clsx("flex items-center justify-between border-b pb-2 mb-3", column.border)}>
                      <div className="flex items-center gap-1.5">
                        <span className={clsx("font-display font-semibold text-sm", column.color)}>{column.label}</span>
                        <span className="w-5 h-5 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[10px] text-gray-400 font-bold">{columnLeads.length}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">R$ {totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    </div>

                    <div className="space-y-3 flex-1 min-h-[450px] p-1">
                      {columnLeads.map((lead) => (
                        <GlassCard key={lead.id} className="p-4 relative group" glow>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-white block truncate max-w-[150px]">{lead.name}</span>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors", getLeadScore(lead).color)}>
                                  {getLeadScore(lead).label}
                                </span>
                                {isColdLead(lead.date, lead.status) && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse whitespace-nowrap">
                                    ⚠️ Frio (+30d)
                                  </span>
                                )}
                                {lead.niche && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.05] border border-white/[0.08] text-gray-300">{lead.niche}</span>}
                                {lead.city && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.05] border border-white/[0.08] text-gray-300">{lead.city}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-gray-500 hover:text-neon-pink opacity-0 group-hover:opacity-100 transition-all p-0.5 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 block truncate font-medium mb-3">{lead.company}</span>
                          
                          <div className="flex items-center justify-between mt-3.5 border-t border-white/[0.03] pt-3.5">
                            <span className="text-[10px] font-bold text-neon-cyan">R$ {lead.value.toLocaleString('pt-BR')}</span>
                            {getSourceBadge(lead.source)}
                          </div>

                          <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-white/[0.02] opacity-50 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => moveLeadStatus(lead.id, 'backward')}
                              disabled={lead.status === 'new'}
                              className="p-1 rounded bg-white/[0.03] border border-white/[0.04] text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronLeft size={10} />
                            </button>
                            <span className="text-[8px] text-gray-500 font-bold">Mover</span>
                            <button
                              onClick={() => moveLeadStatus(lead.id, 'forward')}
                              disabled={lead.status === 'lost'}
                              className="p-1 rounded bg-white/[0.03] border border-white/[0.04] text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronRight size={10} />
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-surface/50 backdrop-blur-md">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01] text-xs text-gray-400 uppercase">
                    <th className="p-4 pl-6">Nome / Empresa</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">Origem</th>
                    <th className="p-4">Etapa</th>
                    <th className="p-4">Contrato</th>
                    <th className="p-4 text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors text-xs">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="block font-semibold text-white">{lead.name}</span>
                          {isColdLead(lead.date, lead.status) && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse whitespace-nowrap">
                              ⚠️ Frio
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500">{lead.company}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lead.niche && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.05] border border-white/[0.08] text-gray-300">{lead.niche}</span>}
                          {lead.city && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.05] border border-white/[0.08] text-gray-300">{lead.city}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="block text-gray-300">{lead.email}</span>
                        <span className="block text-gray-500 mt-0.5">{lead.phone}</span>
                      </td>
                      <td className="p-4">{getSourceBadge(lead.source)}</td>
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          className="px-2 py-1 rounded bg-white/[0.02] border border-white/[0.06] text-xs text-gray-300 focus:outline-none cursor-pointer"
                        >
                          <option value="new" className="bg-surface">Sem Contato</option>
                          <option value="contacted" className="bg-surface">Contatado</option>
                          <option value="qualified" className="bg-surface">Qualificado</option>
                          <option value="proposal" className="bg-surface">Proposta</option>
                          <option value="won" className="bg-surface">Ganha</option>
                          <option value="lost" className="bg-surface">Perdida</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm font-semibold text-neon-cyan">
                        R$ {lead.value.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button onClick={() => deleteLead(lead.id)} className="text-gray-500 hover:text-neon-pink p-1 cursor-pointer"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ACTIVE CLIENTS TAB CONTENT */}
      {mainTab === 'clients' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          
          {/* MRR Dashboard Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden" glow>
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 block relative z-10 flex items-center gap-1.5"><Landmark size={14}/> Receita Recorrente (MRR)</span>
              <span className="text-3xl font-display font-bold text-white block relative z-10">R$ {clients.reduce((acc, c) => acc + (c.monthlyFee || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </GlassCard>
            <GlassCard className="p-6 border border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden" glow>
              <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 block relative z-10 flex items-center gap-1.5"><TrendingUp size={14}/> Verba de Mídia sob Gestão</span>
              <span className="text-3xl font-display font-bold text-white block relative z-10">R$ {clients.reduce((acc, c) => acc + (c.adSpendBudget || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </GlassCard>
            <GlassCard className="p-6 border border-purple-500/20 bg-purple-500/5 relative overflow-hidden flex flex-col justify-center" glow>
               <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
               <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 block relative z-10 flex items-center gap-1.5"><Building2 size={14}/> Contratos Ativos</span>
               <span className="text-3xl font-display font-bold text-white block relative z-10">{clients.length} <span className="text-sm text-gray-400 font-normal">empresas</span></span>
            </GlassCard>
          </div>

          {/* Lista de Clientes Ativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <GlassCard 
              key={client.id} 
              className="p-6 relative border border-white/[0.04] overflow-hidden cursor-pointer group" 
              glow
              onClick={() => setSelectedClientProfile(client)}
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-neon-indigo/5 rounded-full blur-xl pointer-events-none group-hover:bg-neon-indigo/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-md font-display font-semibold text-white">{client.company}</h4>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Responsável: {client.name}</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.niche && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.05] border border-white/[0.08] text-gray-300">{client.niche}</span>}
                    {client.city && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/[0.05] border border-white/[0.08] text-gray-300">{client.city}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteClient(client.id);
                  }}
                  className="text-gray-500 hover:text-neon-pink p-1 cursor-pointer z-10 relative"
                  title="Cancelar Contrato"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Client Metrics Table inside card */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-white/[0.04] py-4 my-4 text-xs">
                <div>
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[8px] block">Fee Mensal</span>
                  <span className="font-display font-bold text-white block mt-0.5">
                    R$ {client.monthlyFee.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[8px] block">Setup Pago</span>
                  <span className="font-display font-bold text-gray-300 block mt-0.5">
                    R$ {client.setupFee.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[8px] block">Budget Mídia/mês</span>
                  <span className="font-display font-bold text-neon-cyan block mt-0.5">
                    R$ {client.adSpendBudget.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[8px] block">Início Contrato</span>
                  <span className="font-display font-bold text-gray-300 block mt-0.5">{client.contractStartDate}</span>
                </div>
              </div>

              {/* Contact Area */}
              <div className="space-y-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-2"><Mail size={12} className="text-gray-500" /> {client.email}</span>
                <span className="flex items-center gap-2"><Phone size={12} className="text-gray-500" /> {client.phone}</span>
              </div>
            </GlassCard>
          ))}

          {filteredClients.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-xs italic font-medium col-span-1 md:col-span-2 lg:col-span-3 bg-white/[0.01] rounded-2xl border border-white/[0.04]">
              Nenhum cliente ativo cadastrado no sistema. Mova um lead para a etapa "Ganha" para gerar um contrato.
            </div>
          )}
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => setLeadModalOpen(false)}></div>
          <GlassCard className="w-full max-w-lg p-6 relative z-10 border border-white/[0.08]" glow>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <PlusCircle className="text-neon-indigo" size={20} />
                <h3 className="text-md font-display font-semibold text-white">Cadastrar Novo Lead</h3>
              </div>
              <button onClick={() => setLeadModalOpen(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/[0.04] cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nome Completo *</label>
                  <input
                    type="text" required value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} placeholder="Ex: Rodrigo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Empresa / Negócio *</label>
                  <input
                    type="text" required value={newLeadCompany} onChange={(e) => setNewLeadCompany(e.target.value)} placeholder="Ex: Construtora Jácome"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">E-mail</label>
                  <input
                    type="email" value={newLeadEmail} onChange={(e) => setNewLeadEmail(e.target.value)} placeholder="Ex: contato@empresa.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">WhatsApp</label>
                  <input
                    type="text" value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} placeholder="Ex: (11) 98765-4321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tipo / Nicho</label>
                  <input
                    type="text" value={newLeadNiche} onChange={(e) => setNewLeadNiche(e.target.value)} placeholder="Ex: Advocacia, Saúde..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cidade</label>
                  <input
                    type="text" value={newLeadCity} onChange={(e) => setNewLeadCity(e.target.value)} placeholder="Ex: São Paulo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Valor Estimado Contrato (mês)</label>
                  <input
                    type="number" value={newLeadValue} onChange={(e) => setNewLeadValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Canal de Captação</label>
                  <select
                    value={newLeadSource} onChange={(e) => setNewLeadSource(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-neon-indigo/50 transition-colors cursor-pointer"
                  >
                    <option value="meta" className="bg-surface">Meta Ads</option>
                    <option value="google" className="bg-surface">Google Ads</option>
                    <option value="organic" className="bg-surface">Orgânico</option>
                    <option value="referral" className="bg-surface">Indicação</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dores / Detalhes</label>
                <textarea
                  rows={2} value={newLeadNotes} onChange={(e) => setNewLeadNotes(e.target.value)} placeholder="Necessidades de tráfego/vendas..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-white/[0.04]">
                <button type="button" onClick={() => setLeadModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.02] text-xs text-gray-400 cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo cursor-pointer">Salvar Lead</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* CREATE CLIENT MODAL */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm" onClick={() => setClientModalOpen(false)}></div>
          <GlassCard className="w-full max-w-lg p-6 relative z-10 border border-white/[0.08]" glow>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3.5 mb-5">
              <div className="flex items-center gap-2">
                <Briefcase className="text-neon-indigo" size={20} />
                <h3 className="text-md font-display font-semibold text-white">Registrar Novo Contrato de Cliente</h3>
              </div>
              <button onClick={() => setClientModalOpen(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/[0.04] cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Empresa / Cliente *</label>
                  <input
                    type="text" required value={newClientCompany} onChange={(e) => setNewClientCompany(e.target.value)} placeholder="Ex: Sorriso Perfeito"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Gestor Responsável *</label>
                  <input
                    type="text" required value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Ex: Patrícia Souza"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">E-mail Financeiro</label>
                  <input
                    type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="Ex: financeiro@sorrisoperfeito.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Telefone Comercial</label>
                  <input
                    type="text" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Ex: (11) 98129-0630"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tipo / Nicho</label>
                  <input
                    type="text" value={newClientNiche} onChange={(e) => setNewClientNiche(e.target.value)} placeholder="Ex: Advocacia, Saúde..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cidade</label>
                  <input
                    type="text" value={newClientCity} onChange={(e) => setNewClientCity(e.target.value)} placeholder="Ex: São Paulo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Setup R$</label>
                  <input
                    type="number" value={newClientSetup} onChange={(e) => setNewClientSetup(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fee Mensal R$</label>
                  <input
                    type="number" value={newClientMonthly} onChange={(e) => setNewClientMonthly(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Budget Mídia R$</label>
                  <input
                    type="number" value={newClientBudget} onChange={(e) => setNewClientBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white focus:outline-none focus:border-neon-indigo/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-white/[0.04]">
                <button type="button" onClick={() => setClientModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/[0.02] text-xs text-gray-400 cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-indigo to-neon-cyan text-xs font-semibold text-white shadow-glow-indigo cursor-pointer">Salvar Contrato</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* CLIENT PROFILE MODAL (ERP DETAILED) */}
      {selectedClientProfile && (
        <ClientProfileModal 
          client={selectedClientProfile} 
          onClose={() => setSelectedClientProfile(null)} 
        />
      )}

    </div>
  );
};
