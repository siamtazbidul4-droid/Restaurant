import mongoose, { Schema, Document } from 'mongoose';

export interface IPrivateEventInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  eventType: 'Birthday' | 'Anniversary' | 'Corporate Dinner' | 'Wedding' | 'Private Party' | 'Business Gathering' | 'Other';
  guestCount: number;
  preferredDate: string;
  preferredTime: string;
  budgetRange?: string;
  specialRequirements?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'In Discussion' | 'Proposal Sent' | 'Confirmed' | 'Declined' | 'Completed';
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrivateEventInquirySchema = new Schema<IPrivateEventInquiry>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    eventType: {
      type: String,
      enum: ['Birthday', 'Anniversary', 'Corporate Dinner', 'Wedding', 'Private Party', 'Business Gathering', 'Other'],
      default: 'Corporate Dinner',
    },
    guestCount: { type: Number, required: true, min: 1 },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    budgetRange: { type: String, default: '' },
    specialRequirements: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Discussion', 'Proposal Sent', 'Confirmed', 'Declined', 'Completed'],
      default: 'New',
    },
    internalNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

PrivateEventInquirySchema.index({ status: 1 });
PrivateEventInquirySchema.index({ preferredDate: 1 });

export const PrivateEventInquiry =
  mongoose.models.PrivateEventInquiry ||
  mongoose.model<IPrivateEventInquiry>('PrivateEventInquiry', PrivateEventInquirySchema);
