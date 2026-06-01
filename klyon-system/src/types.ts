export interface Campaign {
  id: string;
  clientId?: string;
  name: string;
  platform: 'meta' | 'google';
  status: 'active' | 'paused';
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roi: number;
  roas?: number;
  ticketMedio?: number;
  taxaConversao?: number;
  ltv?: number;
  cpm?: number;
  cpv?: number;
  cpv_x?: number;
  alcance?: number;
  frequencia?: number;
  connectRate?: number;
}

export interface Lead {
  id: string;
  clientId?: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  value: number;
  company: string;
  date: string;
  source: 'meta' | 'google' | 'organic' | 'referral';
  niche?: string;
  city?: string;
  notes: string;
}

export interface ClientActivity {
  id: string;
  date: string;
  title: string;
  description: string;
  cost: number;
  adSpend: number;
  type: 'service' | 'ads' | 'support' | 'other';
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  niche?: string;
  city?: string;
  monthlyFee: number;
  setupFee: number;
  activeCampaignsCount: number;
  adSpendBudget: number;
  status: 'active' | 'inactive';
  contractStartDate: string;
  contractEndDate?: string;
  totalAdSpend?: number;
  totalAgencySpend?: number;
  servicesContracted?: {
    id: string;
    name: string;
    price: number;
    date: string;
  }[];
  activityHistory: ClientActivity[];
  autoResponderEnabled?: boolean;
  autoResponderMessage?: string;
  aiEnabled?: boolean;
  aiPrompt?: string;
}

export interface Transaction {
  id: string;
  clientId?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'setup_fee' | 'monthly_fee' | 'ads_budget' | 'software' | 'commission' | 'infrastructure' | 'other';
  clientName?: string;
  date: string;
  status: 'paid' | 'pending';
}

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  stepsCount: number;
  activeLeads: number;
  conversionRate: number;
  status: 'active' | 'paused';
  steps: AutomationStep[];
}

export interface AutomationStep {
  id: string;
  type: 'trigger' | 'whatsapp' | 'email' | 'delay' | 'condition';
  title: string;
  desc: string;
  config?: Record<string, string | number | boolean>;
}

export interface Appointment {
  _id: string;
  title: string;
  date: string;
  duration: number;
  clientId: string;
  leadId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface QuickReply {
  _id: string;
  clientId: string;
  shortcut: string;
  content: string;
}

export interface DashboardMetrics {
  totalSpent: number;
  totalRevenue: number;
  totalLeads: number;
  averageCPA: number;
  roi: number;
  conversionRate: number;
}

export interface FinancialSummary {
  grossRevenue: number;
  adSpend: number;
  operationalCosts: number;
  netProfit: number;
  margin: number;
  cac: number;
  ltv: number;
}

export interface WebhookLink {
  id: string;
  clientId?: string;
  name: string;
  urlId: string;
  source: string;
  status: 'active' | 'inactive';
  leadsCount: number;
  createdAt: string;
}

export interface WhatsappChat {
  id: string;
  name: string;
  unreadCount: number;
  timestamp: number;
  isGroup: boolean;
  lastMessage: string | null;
}

export interface WhatsappMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: number;
  type: string;
  hasMedia: boolean;
}

export interface AppNotification {
  _id: string;
  type: 'whatsapp_message' | 'new_lead' | 'auto_responder' | 'system';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export interface AgencyTask {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  clientId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id?: string;
  _id?: string;
  clientId: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED';
  description: string;
  asaasId?: string;
  invoiceUrl?: string;
  pixEncodedImage?: string;
  pixPayload?: string;
  createdAt?: string;
}
