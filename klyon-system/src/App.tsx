import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LeadsCRM } from './pages/LeadsCRM';
import { Finance } from './pages/Finance';
import { CampaignsPage } from './pages/CampaignsPage';
import { Reports } from './pages/Reports';
import { Automations } from './pages/Automations';
import { WebhooksManager } from './pages/WebhooksManager';
import { Inbox } from './pages/Inbox';
import { CalendarPage } from './pages/CalendarPage';
import { Tasks } from './pages/Tasks';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { Toast } from './components/Toast';
import type { ToastType } from './components/Toast';
import { initialLeads, initialCampaigns, initialClients, initialTransactions, initialAutomations } from './mockData';
import type { Lead, Campaign, Client, Transaction, AutomationFlow, DashboardMetrics, FinancialSummary } from './types';
import { leadsApi, clientsApi, transactionsApi, automationsApi, campaignsApi, authApi } from './api';
import { ClientPortal } from './pages/ClientPortal';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('klyon_token');
  });

  // Toast State
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automations, setAutomations] = useState<AutomationFlow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appError, setAppError] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('klyon_token');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let user;
        if (localStorage.getItem('klyon_token') === 'mvp_bypass_token') {
          user = { id: 'admin_mock', role: 'admin', email: 'admin@klyon.com.br', name: 'Admin Klyon' };
        } else {
          user = await authApi.getMe();
        }
        setCurrentUser(user);

        // Se for cliente, o backend já vai filtrar usando o token. Não precisamos mandar selectedClientId
        const clientIdFilter = user.role === 'admin' ? selectedClientId : undefined;

        const [apiClients, apiLeads, apiTransactions, apiCampaigns, apiAutomations] = await Promise.all([
          clientsApi.getAll(),
          leadsApi.getAll(),
          transactionsApi.getAll(),
          campaignsApi.getAll(),
          automationsApi.getAll(clientIdFilter) 
        ]);
        setClients(apiClients);
        setLeads(apiLeads);
        setTransactions(apiTransactions);
        setCampaigns(apiCampaigns);
        setAutomations(apiAutomations);
      } catch (error: any) {
        console.warn('⚠️ Erro no fetchData:', error);
        if (localStorage.getItem('klyon_token') !== 'mvp_bypass_token') {
          setAppError(error?.message || 'Erro desconhecido ao carregar dados da API.');
        }
        
        // Carrega dados simulados
        setClients(initialClients);
        setLeads(initialLeads);
        setTransactions(initialTransactions);
        setCampaigns(initialCampaigns);
        setAutomations(initialAutomations);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, selectedClientId]);

  // (Removidos os sincronizadores aggressively do localStorage para não travar o React)



  // 24h Report Simulator Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndSendReport = () => {
      const lastReportStr = localStorage.getItem('klyon_last_report');
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (!lastReportStr || (now - parseInt(lastReportStr, 10)) > twentyFourHours) {
        // Trigger report notification
        showToast('Relatório Diário gerado e enviado com sucesso! 📊', 'success');
        localStorage.setItem('klyon_last_report', now.toString());
      }
    };

    // Check on mount
    checkAndSendReport();
    
    // And set an interval to check every hour while the app is open
    const interval = setInterval(checkAndSendReport, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Filtragem Global por Cliente
  const filteredCampaigns = selectedClientId === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.clientId === selectedClientId);

  const filteredLeads = selectedClientId === 'all'
    ? leads
    : leads.filter(l => l.clientId === selectedClientId);

  const filteredTransactions = selectedClientId === 'all'
    ? transactions
    : transactions.filter(t => t.clientId === selectedClientId);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard campaigns={filteredCampaigns} leads={filteredLeads} setActiveTab={setActiveTab} />;
      case 'crm':
        return <LeadsCRM leads={filteredLeads} setLeads={setLeads} clients={clients} setClients={setClients} setTransactions={setTransactions} />;
      case 'finance':
        return <Finance transactions={filteredTransactions} setTransactions={setTransactions} campaigns={filteredCampaigns} />;
      case 'campaigns':
        return <CampaignsPage campaigns={filteredCampaigns} setCampaigns={setCampaigns} />;
      case 'reports':
        return <Reports clients={clients} campaigns={filteredCampaigns} leads={filteredLeads} />;
      case 'automations':
        return <Automations automations={automations} setAutomations={setAutomations} />;
      case 'inbox':
        return <Inbox />;
      case 'calendar':
        return <CalendarPage clients={clients} selectedClientId={selectedClientId} />;
      case 'webhooks':
        return <WebhooksManager clients={clients} />;
      case 'tasks':
        return <Tasks clients={clients} selectedClientId={selectedClientId} />;
      case 'catalog':
        return <Catalog />;
      default:
        return <Dashboard campaigns={filteredCampaigns} leads={filteredLeads} setActiveTab={setActiveTab} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-indigo border-t-transparent rounded-full animate-spin shadow-glow-indigo mb-4"></div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Carregando Klyon...</span>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-center p-6">
        <div className="text-rose-500 mb-4 bg-rose-500/10 p-4 rounded-full">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Erro de Conexão</h2>
        <p className="text-gray-400 mb-6 max-w-md">{appError}</p>
        <button 
          onClick={() => {
            setIsAuthenticated(false);
            localStorage.removeItem('klyon_token');
            setAppError(null);
          }}
          className="px-6 py-2 bg-neon-indigo text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Voltar para o Login
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Inicializando Sessão...</span>
      </div>
    );
  }

  // RENDERIZAÇÃO DO PORTAL DO CLIENTE (Read-Only)
  if (currentUser.role === 'client') {
    return (
      <ClientPortal 
        currentUser={currentUser}
        clients={clients}
        campaigns={campaigns}
        leads={leads}
        transactions={transactions}
        onLogout={() => setIsAuthenticated(false)}
      />
    );
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // RENDERIZAÇÃO DO PORTAL DA AGÊNCIA (Full Access)
  return (
    <div className="flex bg-primary min-h-screen text-gray-100 antialiased overflow-x-hidden relative">
      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
      {/* Sidebar Navigation - hidden in print */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setIsAuthenticated(false)} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 print:bg-white print:text-black">
        {/* Header Area - hidden in print */}
        <Header 
          activeTab={activeTab} 
          onLogout={() => setIsAuthenticated(false)} 
          clients={clients} 
          selectedClientId={selectedClientId} 
          onClientSelect={setSelectedClientId} 
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto pb-16 print:p-0 print:max-w-none relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-neon-indigo border-t-transparent rounded-full animate-spin shadow-glow-indigo"></div>
            </div>
          ) : (
            renderActivePage()
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
