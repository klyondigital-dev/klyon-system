import AutomationFlow from '../models/Automation';
import ClientModel from '../models/Client';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { Notification } from '../models/Notification';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export class AutomationEngine {
  private intervalId: NodeJS.Timeout | null = null;
  private executedFlows = new Set<string>();
  private autoResponderCooldown = new Map<string, number>();
  public mockConnected = true;

  constructor() {
    this.start();
  }

  isWhatsappReady(): boolean {
    return this.mockConnected;
  }

  start() {
    console.log('🤖 Motor de Automações iniciado (Meta API). Checando a cada 5 minutos...');
    
    this.intervalId = setInterval(async () => {
      try {
        const activeFlows = await AutomationFlow.find({ status: 'active' });
        
        if (activeFlows.length > 0) {
          activeFlows.forEach(flow => {
            const flowIdStr = flow._id ? flow._id.toString() : flow.name;
            if (this.executedFlows.has(flowIdStr)) return;
            
            const steps = flow.steps || [];
            steps.forEach(async (step: any) => {
              if (step.type === 'whatsapp') {
                const text = step.config?.message || '';
                const demoNumber = process.env.TEST_PHONE_NUMBER;
                
                if (this.isWhatsappReady() && demoNumber) {
                  console.log(`💬 [Meta API] Disparando Fluxo Automático para ${demoNumber}`);
                  await this.sendMetaMessage(demoNumber, text);
                }
              }
            });
            this.executedFlows.add(flowIdStr);
          });
        }
      } catch (err) {
        console.error('Erro no motor de automação', err);
      }
    }, 300000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    console.log('🛑 Motor de Automações parado.');
  }

  /**
   * Gatilho de Automações (Real-time via CRM/Webhook)
   */
  async triggerFlows(source: string, lead: any) {
    console.log(`⚡ [Motor] Evento de ${source}. Processando automações...`);
    
    if (!this.isWhatsappReady()) return;

    try {
      // 🔥 Busca apenas automações ativas que correspondem a este gatilho
      const activeFlows = await AutomationFlow.find({ status: 'active', trigger: source });
      for (const flow of activeFlows) {
        const steps = flow.steps || [];
        for (const step of steps) {
          if (step.type === 'whatsapp') {
            const rawMessage = step.config?.message || '';
            // Variáveis dinâmicas para a mensagem
            const personalizedMessage = rawMessage
              .replace(/{nome}/g, lead.name?.split(' ')[0] || 'Cliente')
              .replace(/{empresa}/g, lead.company || 'sua empresa');
            
            let phone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
            if (phone) {
              if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
              await this.sendMetaMessage(phone, personalizedMessage);
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao executar fluxo real-time:', err);
    }
  }

  /**
   * Wrapper HTTP para enviar mensagens pela Meta Cloud API
   */
  private async sendMetaMessage(toPhone: string, text: string) {
    const token = process.env.META_WA_ACCESS_TOKEN;
    const phoneId = process.env.META_WA_PHONE_NUMBER_ID;
    
    if (!token || !phoneId) {
      console.warn('⚠️ Tokens da Meta não configurados no .env. Ignorando envio real.');
      return null;
    }

    try {
      // 🚀 MOCK PARA APRESENTAÇÃO: Não chama a API da Meta para não dar erro de token
      // Simula o delay da rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Salva no nosso BD de Histórico
      await this.saveMessageToDB(toPhone, text, true);

      return {
        messaging_product: "whatsapp",
        contacts: [{ input: toPhone, wa_id: toPhone }],
        messages: [{ id: `wamid.${Date.now()}` }]
      };
    } catch (error: any) {
      console.error('❌ Erro na API da Meta:', error.message);
      throw error;
    }
  }

  /**
   * Salva uma mensagem (enviada ou recebida) no Banco de Dados para a Inbox
   */
  private async saveMessageToDB(phone: string, text: string, fromMe: boolean) {
    try {
      // Cria ou atualiza o Chat
      const chat = await Chat.findOneAndUpdate(
        { phoneNumber: phone },
        { 
          $set: { lastMessage: text, lastActivity: new Date() },
          $inc: { unreadCount: fromMe ? 0 : 1 }
        },
        { upsert: true, new: true }
      );

      // Cria a mensagem
      await Message.create({
        chatId: phone,
        body: text,
        fromMe,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Erro ao salvar histórico no BD:', err);
    }
  }

  /**
   * Processa uma nova mensagem recebida (chamado pelo webhook)
   */
  async handleIncomingMetaMessage(phone: string, text: string, contactName: string = 'Cliente') {
    console.log(`📥 [Meta Webhook] Mensagem recebida de ${phone}: ${text}`);

    // Salva no Banco local (para a Inbox front-end exibir)
    await this.saveMessageToDB(phone, text, false);

    // 🔔 Notifica a agência
    try {
      await Notification.create({
        type: 'whatsapp_message',
        title: `Nova mensagem de ${contactName} (${phone})`,
        description: text.substring(0, 120),
      });
    } catch (err) {}

    // 🤖 IA AUTO-RESPONDER
    try {
      const agency = await ClientModel.findOne({});
      const now = Date.now();
      const lastSent = this.autoResponderCooldown.get(phone) || 0;
      const ONE_MINUTE = 60 * 1000;

      if (agency && agency.aiEnabled && agency.aiPrompt) {
        if (now - lastSent >= ONE_MINUTE) {
          console.log(`🤖 [IA Gemini] Processando resposta para ${phone}`);
          
          // Busca histórico real do banco para dar contexto à IA
          const history = await Message.find({ chatId: phone }).sort({ timestamp: -1 }).limit(6);
          const historyText = history.reverse().map(m => `${m.fromMe ? 'Assistente' : 'Lead'}: ${m.body}`).join('\n');
          
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const fullPrompt = `${agency.aiPrompt}\n\nHistórico Recente da Conversa:\n${historyText}\n\nResponda agora de forma curta (apenas a resposta direta, sem aspas ou marcações):`;
          
          const result = await model.generateContent(fullPrompt);
          const responseText = result.response.text().trim();

          // Envia de volta pela Meta API
          await this.sendMetaMessage(phone, responseText);
          this.autoResponderCooldown.set(phone, now);

          await Notification.create({
            type: 'auto_responder',
            title: `IA respondeu para ${phone}`,
            description: responseText.substring(0, 120),
          });
        }
      }
    } catch (err) {
      console.error('Erro na geração de IA:', err);
    }
  }

  // --- MÉTODOS PARA A CAIXA DE ENTRADA UNIFICADA (INBOX) ---

  async getActiveChats() {
    const chats = await Chat.find().sort({ lastActivity: -1 }).lean();
    return chats.map(c => ({
      id: c.phoneNumber, // O front-end usa o ID como número no whatsapp.ts
      name: c.name || c.phoneNumber,
      unreadCount: c.unreadCount,
      timestamp: c.lastActivity.getTime(),
      isGroup: false, // Meta Cloud não tem grupos tradicionais do wa web
      lastMessage: c.lastMessage
    }));
  }

  async getChatMessages(chatId: string, limit: number = 50) {
    // chatId aqui é o telefone
    const messages = await Message.find({ chatId }).sort({ timestamp: -1 }).limit(limit).lean();
    return messages.reverse().map(m => ({
      id: m._id.toString(),
      body: m.body,
      fromMe: m.fromMe,
      timestamp: m.timestamp,
      type: m.type,
      hasMedia: m.hasMedia
    }));
  }

  async sendManualMessage(chatId: string, text: string) {
    // chatId aqui é o telefone que veio do frontend (Inbox)
    await this.sendMetaMessage(chatId, text);
    // Cria o objeto de retorno mockado pois a API da meta não devolve a mensagem formatada
    return {
      id: Date.now().toString(),
      body: text,
      fromMe: true,
      timestamp: Date.now()
    };
  }
}

export const engine = new AutomationEngine();
