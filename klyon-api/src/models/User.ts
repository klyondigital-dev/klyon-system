import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'client';
  clientId?: string; // ID of the client (for client portal)
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'admin' },
  clientId: { type: String, required: false }, // Store as string to match existing seed logic
  createdAt: { type: Date, default: Date.now }
});

// Transform _id to id in JSON response
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const r = ret as any;
    r.id = r._id ? r._id.toString() : '';
    delete r._id;
    delete r.passwordHash; // Do NOT send the password hash back to the client
    delete r.__v;
    return r;
  }
});

export default mongoose.model<IUser>('User', UserSchema);
