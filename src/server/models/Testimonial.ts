import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  customerName: string;
  roleOrAffiliation?: string;
  review: string;
  rating: number;
  date: string;
  source: string;
  avatar?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true, trim: true },
    roleOrAffiliation: { type: String, default: 'Private Dining Guest' },
    review: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    source: { type: String, default: 'Gastronomy Journal' },
    avatar: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TestimonialSchema.index({ isPublished: 1, sortOrder: 1 });

export const Testimonial =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
