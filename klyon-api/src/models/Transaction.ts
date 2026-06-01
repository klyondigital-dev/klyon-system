import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  description: string;
  clientId?: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'setup_fee' | 'monthly_fee' | 'ads_budget' | 'software' | 'commission' | 'infrastructure' | 'other';
  clientName?: string;
  date: string;
  status: 'paid' | 'pending';
}

const TransactionSchema: Schema = new Schema({
  description: { type: String, required: true },
  clientId: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ['setup_fee', 'monthly_fee', 'ads_budget', 'software', 'commission', 'infrastructure', 'other'], required: true },
  clientName: { type: String },
  date: { type: String, required: true },
  status: { type: String, enum: ['paid', 'pending'], default: 'paid' }
}, { timestamps: true });

// Transform _id to id in JSON response
TransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as any;
    r.id = r._id ? r._id.toString() : '';
    delete r._id;
    delete r.__v;
    return r;
  }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
