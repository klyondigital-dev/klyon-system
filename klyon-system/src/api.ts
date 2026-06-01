import type { AutomationFlow, Lead, Client, Transaction, Campaign, WebhookLink } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('klyon_token');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
};

// --- AUTH API ---
export const authApi = {
  async getMe(): Promise<{ id: string, name: string, email: string, role: string, clientId?: string }> {
    const res = await fetchWithAuth(`${API_URL}/auth/me`);
    if (!res.ok) throw new Error('Token inválido ou expirado');
    return res.json();
  }
};

// --- LEADS API ---
export const leadsApi = {
  async getAll(): Promise<Lead[]> {
    const res = await fetchWithAuth(`${API_URL}/crm/leads`);
    if (!res.ok) throw new Error('Falha ao buscar leads');
    return res.json();
  },
  
  async create(lead: Omit<Lead, 'id'>): Promise<Lead> {
    const res = await fetchWithAuth(`${API_URL}/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    if (!res.ok) throw new Error('Falha ao criar lead');
    return res.json();
  },

  async update(id: string, lead: Partial<Lead>): Promise<Lead> {
    const res = await fetchWithAuth(`${API_URL}/crm/lead/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    if (!res.ok) throw new Error('Falha ao atualizar lead');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/crm/lead/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao remover lead');
  }
};

// --- CLIENTS API ---
export const clientsApi = {
  async getAll(): Promise<Client[]> {
    const res = await fetchWithAuth(`${API_URL}/crm/clients`);
    if (!res.ok) throw new Error('Falha ao buscar clientes');
    return res.json();
  },
  
  async create(client: Omit<Client, 'id'>): Promise<Client> {
    const res = await fetchWithAuth(`${API_URL}/crm/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!res.ok) throw new Error('Falha ao registrar cliente');
    return res.json();
  },

  async update(id: string, client: Partial<Client>): Promise<Client> {
    const res = await fetchWithAuth(`${API_URL}/crm/client/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!res.ok) throw new Error('Falha ao atualizar cliente');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/crm/client/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao cancelar contrato de cliente');
  }
};

// --- TRANSACTIONS API ---
export const transactionsApi = {
  async getAll(): Promise<Transaction[]> {
    const res = await fetchWithAuth(`${API_URL}/crm/transactions`);
    if (!res.ok) throw new Error('Falha ao buscar transações');
    return res.json();
  },
  
  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const res = await fetchWithAuth(`${API_URL}/crm/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!res.ok) throw new Error('Falha ao registrar transação');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/crm/transaction/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao remover transação');
  }
};

// --- CAMPAIGNS API ---
export const campaignsApi = {
  async getAll(): Promise<Campaign[]> {
    const res = await fetchWithAuth(`${API_URL}/crm/campaigns`);
    if (!res.ok) throw new Error('Falha ao buscar campanhas');
    return res.json();
  },
  
  async create(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
    const res = await fetchWithAuth(`${API_URL}/crm/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    });
    if (!res.ok) throw new Error('Falha ao registrar campanha');
    return res.json();
  },

  async update(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const res = await fetchWithAuth(`${API_URL}/crm/campaign/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    });
    if (!res.ok) throw new Error('Falha ao atualizar campanha');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/crm/campaign/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao remover campanha');
  }
};

// --- AUTOMATIONS API ---
export const automationsApi = {
  async getAll(clientId?: string): Promise<AutomationFlow[]> {
    const url = clientId && clientId !== 'all' ? `${API_URL}/automations?clientId=${clientId}` : `${API_URL}/automations`;
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Falha ao buscar automações');
    return res.json();
  },
  
  async save(flow: AutomationFlow): Promise<AutomationFlow> {
    const isNew = !flow.id.includes('_') && flow.id.length === 24 ? false : true;
    
    const url = isNew ? `${API_URL}/automations` : `${API_URL}/automations/${flow.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetchWithAuth(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flow)
    });
    if (!res.ok) throw new Error('Falha ao salvar automação');
    return res.json();
  }
};

// --- WEBHOOKS API ---
export const webhooksApi = {
  async getAll(): Promise<WebhookLink[]> {
    const res = await fetchWithAuth(`${API_URL}/webhooks/links`);
    if (!res.ok) throw new Error('Falha ao buscar webhooks');
    return res.json();
  },
  
  async create(webhook: Partial<WebhookLink>): Promise<WebhookLink> {
    const res = await fetchWithAuth(`${API_URL}/webhooks/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhook)
    });
    if (!res.ok) throw new Error('Falha ao criar webhook');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/webhooks/links/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Falha ao remover webhook');
  }
};

// --- WHATSAPP API ---
export const whatsappApi = {
  async getStatus(): Promise<{ ready: boolean; qrAvailable: boolean }> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/status`);
    if (!res.ok) throw new Error('Falha ao buscar status do WhatsApp');
    return res.json();
  },
  
  getQRUrl(): string {
    return `${API_URL}/whatsapp/qr?t=${Date.now()}`; // timestamp evita cache
  },

  async connect(): Promise<{ success: boolean; ready: boolean }> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/connect`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao conectar');
    return res.json();
  },

  async disconnect(): Promise<{ success: boolean; ready: boolean }> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/disconnect`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao desconectar');
    return res.json();
  },

  async getQRBlobUrl(): Promise<string> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/qr?t=${Date.now()}`);
    if (!res.ok) throw new Error('Falha ao buscar QR Code');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  async getChats(): Promise<any[]> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/chats`);
    if (!res.ok) throw new Error('Falha ao buscar chats');
    return res.json();
  },

  async getMessages(chatId: string): Promise<any[]> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/chats/${encodeURIComponent(chatId)}/messages`);
    if (!res.ok) throw new Error('Falha ao buscar mensagens');
    return res.json();
  },

  async sendMessage(chatId: string, text: string): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/whatsapp/chats/${encodeURIComponent(chatId)}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Falha ao enviar mensagem');
    return res.json();
  }
};

// --- APPOINTMENTS API ---
export const appointmentsApi = {
  async getAll(clientId?: string): Promise<any[]> {
    let url = `${API_URL}/appointments`;
    if (clientId && clientId !== 'all') {
      url += `?clientId=${clientId}`;
    }
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Falha ao buscar agendamentos');
    return res.json();
  },

  async create(appointment: any): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error('Falha ao criar agendamento');
    return res.json();
  },

  async update(id: string, appointment: any): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error('Falha ao atualizar agendamento');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao remover agendamento');
  }
};

// --- QUICK REPLIES API ---
export const quickRepliesApi = {
  async getAll(clientId?: string): Promise<any[]> {
    let url = `${API_URL}/quick-replies`;
    if (clientId && clientId !== 'all') {
      url += `?clientId=${clientId}`;
    }
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Falha ao buscar atalhos');
    return res.json();
  },

  async create(quickReply: any): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/quick-replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quickReply),
    });
    if (!res.ok) throw new Error('Falha ao criar atalho');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/quick-replies/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao remover atalho');
  }
};

// --- NOTIFICATIONS API ---
export const notificationsApi = {
  async getAll(): Promise<any[]> {
    const res = await fetchWithAuth(`${API_URL}/notifications`);
    if (!res.ok) throw new Error('Falha ao buscar notificações');
    return res.json();
  },

  async getUnreadCount(): Promise<number> {
    const res = await fetchWithAuth(`${API_URL}/notifications/unread-count`);
    if (!res.ok) throw new Error('Falha ao contar notificações');
    const data = await res.json();
    return data.count;
  },

  async markAllRead(): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Falha ao marcar notificações como lidas');
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao remover notificação');
  }
};

// --- TASKS API ---
export const tasksApi = {
  async getAll(clientId?: string): Promise<any[]> {
    let url = `${API_URL}/tasks`;
    if (clientId && clientId !== 'all') {
      url += `?clientId=${clientId}`;
    }
    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Falha ao buscar tarefas');
    return res.json();
  },

  async create(task: any): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Falha ao criar tarefa');
    return res.json();
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Falha ao atualizar status da tarefa');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao remover tarefa');
  }
};

// --- BILLING / INVOICES API ---
export const billingApi = {
  async getAll(): Promise<any[]> {
    const res = await fetchWithAuth(`${API_URL}/billing`);
    if (!res.ok) throw new Error('Falha ao buscar faturas');
    return res.json();
  },

  async create(invoice: any): Promise<any> {
    const res = await fetchWithAuth(`${API_URL}/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao criar cobrança');
    }
    return res.json();
  }
};
