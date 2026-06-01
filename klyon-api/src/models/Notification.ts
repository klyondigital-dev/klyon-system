import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  type: 'whatsapp_message' | 'new_lead' | 'auto_responder' | 'system';
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true, enum: ['whatsapp_message', 'new_lead', 'auto_responder', 'system'] },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Auto-delete old notifications (keep last 100)
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
