import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationStep {
  type: string;
  title: string;
  desc: string;
  config: any;
}

export interface IAutomationFlow extends Document {
  clientId?: string;
  name: string;
  description: string;
  trigger: string;
  status: 'active' | 'paused';
  steps: IAutomationStep[];
  activeLeads: number;
  conversionRate: number;
  createdAt: Date;
}

const AutomationStepSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String },
  config: { type: Schema.Types.Mixed, default: {} }
}, { _id: true });

const AutomationFlowSchema: Schema = new Schema({
  clientId: { type: String, required: false },
  name: { type: String, required: true },
  description: { type: String },
  trigger: { type: String, default: 'Manual' },
  status: { type: String, enum: ['active', 'paused'], default: 'paused' },
  steps: [AutomationStepSchema],
  activeLeads: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAutomationFlow>('AutomationFlow', AutomationFlowSchema);
