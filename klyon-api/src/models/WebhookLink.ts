import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookLink extends Document {
  clientId?: string;
  name: string;
  urlId: string;
  source: string;
  status: 'active' | 'inactive';
  leadsCount: number;
  createdAt: Date;
}

const WebhookLinkSchema: Schema = new Schema({
  clientId: { type: String, required: false }, // if undefined, it belongs to the agency admin overall
  name: { type: String, required: true },
  urlId: { type: String, required: true, unique: true },
  source: { type: String, default: 'Custom' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  leadsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Transform _id to id in JSON response
WebhookLinkSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as any;
    r.id = r._id ? r._id.toString() : '';
    delete r._id;
    delete r.__v;
    return r;
  }
});

export default mongoose.model<IWebhookLink>('WebhookLink', WebhookLinkSchema);
