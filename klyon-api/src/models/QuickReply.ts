import mongoose, { Document, Schema } from 'mongoose';

export interface IQuickReply extends Document {
  clientId: string; // The client account this belongs to
  shortcut: string; // The slash command (e.g. "proposta")
  content: string; // The text content
  createdAt: Date;
  updatedAt: Date;
}

const quickReplySchema = new Schema<IQuickReply>(
  {
    clientId: { type: String, required: true },
    shortcut: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate shortcuts for the same client
quickReplySchema.index({ clientId: 1, shortcut: 1 }, { unique: true });

export const QuickReply = mongoose.model<IQuickReply>('QuickReply', quickReplySchema);
