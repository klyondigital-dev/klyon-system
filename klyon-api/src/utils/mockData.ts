// mockData from frontend
export const initialCampaigns: any[] = [
  {
    id: 'c1',
    clientId: 'cli3',
    name: 'Klyon | Conversão - Leads Qualificados (Meta)',
    platform: 'meta',
    status: 'active',
    spent: 4250.80,
    impressions: 145000,
    clicks: 3820,
    conversions: 245,
    ctr: 2.63,
    cpc: 1.11,
    cpa: 17.35,
    roi: 3.8
  },
  {
    id: 'c2',
    clientId: 'cli3',
    name: 'Klyon | Tráfego - Remarketing Estrela (Meta)',
    platform: 'meta',
    status: 'active',
    spent: 1280.50,
    impressions: 48000,
    clicks: 1240,
    conversions: 82,
    ctr: 2.58,
    cpc: 1.03,
    cpa: 15.61,
    roi: 4.5
  },
  {
    id: 'c3',
    clientId: 'cli1',
    name: 'Klyon | Pesquisa - Fundo de Funil (Google)',
    platform: 'google',
    status: 'active',
    spent: 5800.00,
    impressions: 32000,
    clicks: 2980,
    conversions: 310,
    ctr: 9.31,
    cpc: 1.95,
    cpa: 18.71,
    roi: 5.2
  },
  {
    id: 'c4',
    clientId: 'cli2',
    name: 'Klyon | Display - Auto-Branding (Google)',
    platform: 'google',
    status: 'paused',
    spent: 850.00,
    impressions: 180000,
    clicks: 920,
    conversions: 15,
    ctr: 0.51,
    cpc: 0.92,
    cpa: 56.66,
    roi: 1.2
  }
];

export const initialLeads: any[] = [
  {
    id: 'l1',
    clientId: 'cli3',
    name: 'Rodrigo Silva',
    email: 'rodrigo.silva@construtorajacome.com.br',
    phone: '(11) 98765-4321',
    status: 'new',
    value: 12500,
    company: 'Construtora Jácome',
    date: '2026-04-10', // Alterado para testar Lead Frio (+30 dias)
    source: 'meta',
    notes: 'Interessado em captação de leads para lançamentos imobiliários de alto padrão.'
  },
  {
    id: 'l2',
    clientId: 'cli1',
    name: 'Amanda Costa',
    email: 'amanda@infinitysaude.com.br',
    phone: '(21) 99888-7766',
    status: 'contacted',
    value: 8000,
    company: 'Infinity Clínica Integrada',
    date: '2026-05-24',
    source: 'google',
    notes: 'Reunião de briefing agendada para 28/05. Foco em Meta Ads e SEO local.'
  },
  {
    id: 'l3',
    clientId: 'cli2',
    name: 'Carlos Eduardo',
    email: 'carlos@vortextech.io',
    phone: '(19) 98111-2233',
    status: 'qualified',
    value: 24000,
    company: 'Vortex Tech',
    date: '2026-05-23',
    source: 'google',
    notes: 'Lead qualificado. Quer escala agressiva no Google Ads e funil no YouTube.'
  },
  {
    id: 'l4',
    clientId: 'cli3',
    name: 'Juliana Mendes',
    email: 'juliana.mendes@luxodecor.com.br',
    phone: '(31) 97555-4433',
    status: 'proposal',
    value: 15000,
    company: 'Luxo Decor Home',
    date: '2026-05-22',
    source: 'meta',
    notes: 'Proposta enviada de R$ 15k/mês. Aguardando feedback da diretoria.'
  },
  {
    id: 'l5',
    clientId: 'cli1',
    name: 'Felipe Albuquerque',
    email: 'felipe@agroforte.com.br',
    phone: '(62) 99666-8899',
    status: 'won',
    value: 36000,
    company: 'AgroForte Insumos',
    date: '2026-05-18',
    source: 'organic',
    notes: 'Contrato fechado! Gestão de tráfego B2B multicanal iniciada.'
  },
  {
    id: 'l6',
    clientId: 'cli2',
    name: 'Patrícia Souza',
    email: 'patricia@clinicasorrisoperfeito.com.br',
    phone: '(18) 98129-0630',
    status: 'won',
    value: 7500,
    company: 'Sorriso Perfeito Odonto',
    date: '2026-05-15',
    source: 'referral',
    notes: 'Indicação. Contrato assinado. Foco em campanhas de implantes e harmonização.'
  },
  {
    id: 'l7',
    clientId: 'cli3',
    name: 'Gustavo Santos',
    email: 'gustavo@eletromultilojas.com',
    phone: '(11) 96444-1122',
    status: 'lost',
    value: 18000,
    company: 'EletroMulti Lojas',
    date: '2026-05-12',
    source: 'meta',
    notes: 'Sem orçamento para a taxa de setup e fee mínimo exigido pela Klyon.'
  },
  {
    id: 'l8',
    clientId: 'cli1',
    name: 'Mariana Oliveira',
    email: 'mariana.oliveira@solarenergia.com.br',
    phone: '(81) 98877-3344',
    status: 'new',
    value: 14000,
    company: 'Solar Energia Nordeste',
    date: '2026-05-25',
    source: 'google',
    notes: 'Preencheu formulário de contato querendo atrair integradores solares.'
  },
  {
    id: 'l9',
    clientId: 'cli2',
    name: 'Bruno Ramos',
    email: 'bruno@sportfitacademia.com.br',
    phone: '(48) 99111-5555',
    status: 'contacted',
    date: '2026-05-25',
    value: 6000,
    company: 'SportFit Academia',
    source: 'meta',
    notes: 'Entrou pelo Direct. Enviado link para agendar reunião comercial.'
  }
];

export const initialClients: any[] = [
  {
    id: 'cli1',
    name: 'Felipe Albuquerque',
    company: 'AgroForte Insumos',
    email: 'felipe@agroforte.com.br',
    phone: '(62) 99666-8899',
    monthlyFee: 3000,
    setupFee: 4000,
    activeCampaignsCount: 2,
    adSpendBudget: 8000,
    status: 'active',
    contractStartDate: '2026-05-18',
    contractEndDate: '2026-11-18',
    totalAdSpend: 15400.00,
    totalAgencySpend: 10000.00,
    servicesContracted: [
      { id: 's1', name: 'Gestão de Tráfego (Mensal)', price: 3000, date: '2026-05-18' },
      { id: 's2', name: 'Setup de Business Manager', price: 4000, date: '2026-05-18' },
      { id: 's3', name: 'Desenvolvimento de Landing Page', price: 3000, date: '2026-05-20' }
    ],
    procedureHistory: [
      { id: 'p1', date: '2026-05-18', description: 'Assinatura do Contrato e Onboarding.', type: 'setup' },
      { id: 'p2', date: '2026-05-20', description: 'Entrega da Landing Page de Captação B2B.', type: 'other' },
      { id: 'p3', date: '2026-05-21', description: 'Subida da Campanha de Conversão no Meta Ads.', type: 'ads_launch' },
      { id: 'p4', date: '2026-05-25', description: 'Reunião semanal de alinhamento e repasse de leads.', type: 'meeting' }
    ]
  },
  {
    id: 'cli2',
    name: 'Patrícia Souza',
    company: 'Sorriso Perfeito Odonto',
    email: 'patricia@clinicasorrisoperfeito.com.br',
    phone: '(18) 98129-0630',
    monthlyFee: 1500,
    setupFee: 2000,
    activeCampaignsCount: 1,
    adSpendBudget: 3000,
    status: 'active',
    contractStartDate: '2026-05-15',
    contractEndDate: '2026-08-15',
    totalAdSpend: 4200.00,
    totalAgencySpend: 3500.00,
    servicesContracted: [
      { id: 's4', name: 'Gestão de Tráfego Local (Mensal)', price: 1500, date: '2026-05-15' },
      { id: 's5', name: 'Setup Inicial Google Meu Negócio', price: 2000, date: '2026-05-15' }
    ],
    procedureHistory: [
      { id: 'p5', date: '2026-05-15', description: 'Reunião de Kickoff e Setup das Contas.', type: 'setup' },
      { id: 'p6', date: '2026-05-16', description: 'Ativação da Campanha de Mensagem no Meta Ads.', type: 'ads_launch' },
      { id: 'p7', date: '2026-05-22', description: 'Otimização de criativos (CPA estava alto).', type: 'optimization' }
    ]
  },
  {
    id: 'cli3',
    name: 'Juliana Mendes',
    company: 'Luxo Decor Home',
    email: 'juliana.mendes@luxodecor.com.br',
    phone: '(31) 97555-4433',
    monthlyFee: 2500,
    setupFee: 3000,
    activeCampaignsCount: 2,
    adSpendBudget: 6000,
    status: 'active',
    contractStartDate: '2026-05-01',
    contractEndDate: '2026-11-01',
    totalAdSpend: 11000.00,
    totalAgencySpend: 5500.00,
    servicesContracted: [
      { id: 's6', name: 'Gestão de Tráfego E-commerce', price: 2500, date: '2026-05-01' },
      { id: 's7', name: 'Setup Pixel e Catálogo', price: 3000, date: '2026-05-01' }
    ],
    procedureHistory: [
      { id: 'p8', date: '2026-05-01', description: 'Configuração avançada do Pixel e Catálogo.', type: 'setup' },
      { id: 'p9', date: '2026-05-03', description: 'Campanhas de Catálogo Advantage+ ativadas.', type: 'ads_launch' },
      { id: 'p10', date: '2026-05-15', description: 'Escala de orçamento nas campanhas campeãs.', type: 'optimization' },
      { id: 'p11', date: '2026-05-20', description: 'Reunião mensal de apresentação de ROI.', type: 'meeting' }
    ]
  }
];

export const initialTransactions: any[] = [
  {
    id: 't1',
    clientId: 'cli1',
    description: 'Setup Fee - AgroForte Insumos',
    amount: 4000,
    type: 'income',
    category: 'setup_fee',
    clientName: 'AgroForte Insumos',
    date: '2026-05-19',
    status: 'paid'
  },
  {
    id: 't2',
    clientId: 'cli2',
    description: 'Setup Fee - Sorriso Perfeito Odonto',
    amount: 2000,
    type: 'income',
    category: 'setup_fee',
    clientName: 'Sorriso Perfeito Odonto',
    date: '2026-05-16',
    status: 'paid'
  },
  {
    id: 't3',
    clientId: 'cli3',
    description: 'Mensalidade Recorrente - Luxo Decor Home',
    amount: 2500,
    type: 'income',
    category: 'monthly_fee',
    clientName: 'Luxo Decor Home',
    date: '2026-05-05',
    status: 'paid'
  },
  {
    id: 't4',
    clientId: 'cli1',
    description: 'Mensalidade Recorrente - AgroForte Insumos',
    amount: 3000,
    type: 'income',
    category: 'monthly_fee',
    clientName: 'AgroForte Insumos',
    date: '2026-05-25',
    status: 'paid'
  },
  {
    id: 't5',
    description: 'Servidor VPS AWS Cloud',
    amount: 320.50,
    type: 'expense',
    category: 'infrastructure',
    date: '2026-05-10',
    status: 'paid'
  },
  {
    id: 't6',
    description: 'Assinatura ActiveCampaign & Vendas CRM',
    amount: 540.00,
    type: 'expense',
    category: 'software',
    date: '2026-05-12',
    status: 'paid'
  },
  {
    id: 't7',
    description: 'Faturamento Anúncios Meta Ads (Créditos)',
    amount: 1500.00,
    type: 'expense',
    category: 'ads_budget',
    date: '2026-05-20',
    status: 'paid'
  },
  {
    id: 't8',
    clientId: 'cli2',
    description: 'Mensalidade Sorriso Perfeito Odonto',
    amount: 1500,
    type: 'income',
    category: 'monthly_fee',
    clientName: 'Sorriso Perfeito Odonto',
    date: '2026-05-25',
    status: 'pending'
  }
];

export const initialAutomations: any[] = [
  {
    id: 'f1',
    name: 'Onboarding de Leads - Facebook Ads',
    description: 'Fluxo imediato disparado assim que um novo lead preenche o formulário no Meta Ads.',
    trigger: 'Webhook: Novo Lead (Meta)',
    stepsCount: 4,
    activeLeads: 24,
    conversionRate: 68.5,
    status: 'active',
    steps: [
      { id: 's1_1', type: 'trigger', title: 'Entrada de Lead', desc: 'Formulário do Instagram/Facebook preenchido.' },
      { id: 's1_2', type: 'whatsapp', title: 'Disparo de WhatsApp', desc: 'Mensagem de boas-vindas com link para agendar call em 1 minuto.' },
      { id: 's1_3', type: 'delay', title: 'Aguardar 2 horas', desc: 'Tempo de espera antes do e-mail comercial.' },
      { id: 's1_4', type: 'email', title: 'E-mail: Portfólio Klyon', desc: 'Envio automático do e-mail com nossos cases de sucesso.' }
    ]
  },
  {
    id: 'f2',
    name: 'Recuperação Comercial - Reunião Não Agendada',
    description: 'Ativado para leads qualificados que não agendaram a call de briefing após 24h.',
    trigger: 'Lead em "Contatado" > 24h sem agendamento',
    stepsCount: 3,
    activeLeads: 8,
    conversionRate: 42.1,
    status: 'active',
    steps: [
      { id: 's2_1', type: 'trigger', title: 'Gatilho de Tempo', desc: 'Falta de evento de agendamento no Calendly.' },
      { id: 's2_2', type: 'whatsapp', title: 'WhatsApp Personalizado', desc: 'Mensagem simpática: "Ficou alguma dúvida sobre nossa conversa de ontem?"' },
      { id: 's2_3', type: 'email', title: 'E-mail: Metodologia Klyon', desc: 'Envio de infográfico detalhando o processo de aceleração.' }
    ]
  }
];

export const calculateDashboardMetrics = (campaigns: any[], leads: any[]): any => {
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalRevenue = leads
    .filter(l => l.status === 'won')
    .reduce((acc, l) => acc + l.value, 0);
  const totalLeads = leads.length;
  
  const paidLeadsCount = leads.filter(l => l.source === 'meta' || l.source === 'google').length;
  const averageCPA = paidLeadsCount > 0 ? totalSpent / paidLeadsCount : 0;
  
  const roi = totalSpent > 0 ? (totalRevenue - totalSpent) / totalSpent : 0;
  
  const wonLeadsCount = leads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? (wonLeadsCount / totalLeads) * 100 : 0;

  return {
    totalSpent,
    totalRevenue,
    totalLeads,
    averageCPA,
    roi,
    conversionRate
  };
};

export const calculateFinancialSummary = (transactions: any[], campaigns: any[]): any => {
  // Entradas pagas
  const grossRevenue = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  // Mídia paga
  const adSpend = campaigns.reduce((acc, c) => acc + c.spent, 0);

  // Custos Operacionais (expenses que não são verba de ads)
  const operationalCosts = transactions
    .filter(t => t.type === 'expense' && t.category !== 'ads_budget')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = grossRevenue - adSpend - operationalCosts;
  
  const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // CAC = AdSpend / Número de clientes ganhos (aproximado por 3)
  const cac = adSpend / 3;

  // LTV = Valor da mensalidade média * tempo de contrato médio (simulado por 6 meses)
  const ltv = 2300 * 6;

  return {
    grossRevenue,
    adSpend,
    operationalCosts,
    netProfit,
    margin,
    cac,
    ltv
  };
};
