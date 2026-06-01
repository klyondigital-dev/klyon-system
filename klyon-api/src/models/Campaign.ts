import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  clientId?: string;
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
  roas: number;
  ticketMedio: number;
  taxaConversao: number;
  ltv: number;
  cpm: number;
  cpv: number;
  cpv_x: number;
  alcance: number;
  frequencia: number;
  connectRate: number;
}

const campaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  clientId: { type: String },
  platform: { type: String, enum: ['meta', 'google'], required: true },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  spent: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  cpc: { type: Number, default: 0 },
  cpa: { type: Number, default: 0 },
  roi: { type: Number, default: 0 },
  roas: { type: Number, default: 0 },
  ticketMedio: { type: Number, default: 0 },
  taxaConversao: { type: Number, default: 0 },
  ltv: { type: Number, default: 0 },
  cpm: { type: Number, default: 0 },
  cpv: { type: Number, default: 0 },
  cpv_x: { type: Number, default: 0 },
  alcance: { type: Number, default: 0 },
  frequencia: { type: Number, default: 0 },
  connectRate: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model<ICampaign>('Campaign', campaignSchema);
