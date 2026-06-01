import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  title: string;
  date: Date;
  duration: number; // in minutes
  clientId: string; // which client account this belongs to
  leadId?: string; // optional: linked lead
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 30 },
    clientId: { type: String, required: true },
    leadId: { type: String },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled'], 
      default: 'scheduled' 
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Add text indexing for search
appointmentSchema.index({ title: 'text', notes: 'text' });
appointmentSchema.index({ clientId: 1, date: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
