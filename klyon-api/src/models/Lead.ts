import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  clientId?: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  value: number;
  company: string;
  source: string;
  niche?: string;
  city?: string;
  notes: string;
  createdAt: Date;
}

const LeadSchema: Schema = new Schema({
  name: { type: String, required: true },
  clientId: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: false },
  status: { type: String, default: 'new' },
  value: { type: Number, default: 0 },
  company: { type: String },
  source: { type: String },
  niche: { type: String, default: '' },
  city: { type: String, default: '' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Transform _id to id in JSON response
LeadSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as any;
    r.id = r._id ? r._id.toString() : '';
    delete r._id;
    delete r.__v;
    return r;
  }
});

export default mongoose.model<ILead>('Lead', LeadSchema);
