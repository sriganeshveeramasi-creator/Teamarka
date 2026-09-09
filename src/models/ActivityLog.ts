import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: string;
  name?: string;
  email: string;
  role: string;
  action: 'LOGIN' | 'LOGOUT' | 'SIGNUP';
  status: 'SUCCESS' | 'FAILED';
  reason?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: String },
    name: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, default: 'user' },
    action: { type: String, enum: ['LOGIN', 'LOGOUT', 'SIGNUP'], required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
    reason: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true, bufferCommands: false }
);

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
