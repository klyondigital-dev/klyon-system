import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  clientId: string;
  amount: number;
  dueDate: Date;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED';
  description: string;
  asaasId?: string;       // ID da cobrança no Asaas
  invoiceUrl?: string;    // Link de pagamento do Asaas
  pixEncodedImage?: string; // QR Code Base64
  pixPayload?: string;    // Pix Copia e Cola
  createdAt: Date;
}

const InvoiceSchema: Schema = new Schema({
  clientId: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'RECEIVED', 'OVERDUE', 'CANCELLED'], default: 'PENDING' },
  description: { type: String, required: true },
  asaasId: { type: String },
  invoiceUrl: { type: String },
  pixEncodedImage: { type: String },
  pixPayload: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Transform _id to id in JSON response
InvoiceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as any;
    r.id = r._id ? r._id.toString() : '';
    delete r._id;
    delete r.__v;
    return r;
  }
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
