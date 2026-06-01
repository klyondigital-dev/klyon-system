import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId: string; // The phoneNumber of the chat
  body: string;
  fromMe: boolean;
  type: string;
  hasMedia: boolean;
  timestamp: number;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: String, required: true, index: true },
    body: { type: String, required: true },
    fromMe: { type: Boolean, required: true },
    type: { type: String, default: 'chat' },
    hasMedia: { type: Boolean, default: false },
    timestamp: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);
