import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  phoneNumber: string;
  name?: string;
  lastMessage?: string;
  unreadCount: number;
  lastActivity: Date;
}

const chatSchema = new Schema<IChat>(
  {
    phoneNumber: { type: String, required: true, unique: true },
    name: { type: String },
    lastMessage: { type: String },
    unreadCount: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
