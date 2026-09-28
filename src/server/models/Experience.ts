import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  category: 'Fine Dining' | 'Romantic Dinner' | 'Family Dining' | 'Business Dinner' | 'Private Dining' | 'Celebration';
  description: string;
  image: string;
  ctaLabel?: string;
  ctaUrl?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Fine Dining', 'Romantic Dinner', 'Family Dining', 'Business Dinner', 'Private Dining', 'Celebration'],
      default: 'Fine Dining',
    },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    ctaLabel: { type: String, default: 'Reserve Table' },
    ctaUrl: { type: String, default: '/reservations' },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExperienceSchema.index({ sortOrder: 1 });
ExperienceSchema.index({ isPublished: 1 });

export const Experience =
  mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);
