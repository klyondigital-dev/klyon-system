import mongoose, { Schema, Document } from 'mongoose';

export interface IClientService {
  id: string;
  name: string;
  price: number;
  date: string;
}

export interface IClientActivity {
  id: string;
  date: string;
  title: string;
  description: string;
  cost: number;
  adSpend: number;
  type: 'service' | 'ads' | 'support' | 'other';
}

export interface IClient extends Document {
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
  status: 'active' | 'paused' | 'cancelled';
  contractStartDate: string;
  contractEndDate?: string;
  totalAdSpend: number;
  totalAgencySpend: number;
  servicesContracted: IClientService[];
  activityHistory: IClientActivity[];
  autoResponderEnabled?: boolean;
  autoResponderMessage?: string;
  aiEnabled?: boolean;
  aiPrompt?: string;
  asaasCustomerId?: string;
}

const ClientServiceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true }
}, { _id: false });

const ClientActivitySchema = new Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  adSpend: { type: Number, default: 0 },
  type: { type: String, enum: ['service', 'ads', 'support', 'other'], required: true }
}, { _id: false });

const ClientSchema: Schema = new Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  niche: { type: String, default: '' },
  city: { type: String, default: '' },
  monthlyFee: { type: Number, default: 0 },
  setupFee: { type: Number, default: 0 },
  activeCampaignsCount: { type: Number, default: 0 },
  adSpendBudget: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  contractStartDate: { type: String, required: true },
  contractEndDate: { type: String },
  totalAdSpend: { type: Number, default: 0 },
  totalAgencySpend: { type: Number, default: 0 },
  servicesContracted: { type: [ClientServiceSchema], default: [] },
  activityHistory: { type: [ClientActivitySchema], default: [] },
  autoResponderEnabled: { type: Boolean, default: false },
  autoResponderMessage: { type: String, default: 'Olá! Não podemos atender agora. Logo entraremos em contato.' },
  aiEnabled: { type: Boolean, default: false },
  aiPrompt: { type: String, default: 'Você é um assistente da Agência. Seu objetivo é pré-qualificar os leads perguntando qual serviço procuram e qual o faturamento da empresa. Seja cordial e curto.' },
  asaasCustomerId: { type: String }
}, { timestamps: true });

// Transform _id to id in JSON response
ClientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as any;
    r.id = r._id ? r._id.toString() : '';
    delete r._id;
    delete r.__v;
    return r;
  }
});

export default mongoose.model<IClient>('Client', ClientSchema);
