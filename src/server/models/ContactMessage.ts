import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Archived';
  emailDeliveryStatus: 'sent' | 'failed' | 'not_configured' | 'pending';
  emailDeliveredTo?: string;
  emailError?: string;
  ipAddress?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Resolved', 'Archived'],
      default: 'New',
    },
    emailDeliveryStatus: {
      type: String,
      enum: ['sent', 'failed', 'not_configured', 'pending'],
      default: 'pending',
    },
    emailDeliveredTo: { type: String, default: '' },
    emailError: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ createdAt: -1 });

export const ContactMessage =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
