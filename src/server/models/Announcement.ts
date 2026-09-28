import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  image?: string;
  priority: 'low' | 'medium' | 'high';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  ctaLabel?: string;
  ctaUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    ctaLabel: { type: String, default: 'Reserve Now' },
    ctaUrl: { type: String, default: '/reservations' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ isPublished: 1, startDate: 1, endDate: 1 });

export const Announcement =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
