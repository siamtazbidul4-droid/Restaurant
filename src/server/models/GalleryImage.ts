import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage extends Document {
  title: string;
  altText: string;
  caption?: string;
  category: 'Food' | 'Interior' | 'Exterior' | 'Chef' | 'Events' | 'Private Dining' | 'Atmosphere';
  imageUrl: string;
  publicId?: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: { type: String, required: true, trim: true },
    altText: { type: String, required: true, trim: true },
    caption: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Food', 'Interior', 'Exterior', 'Chef', 'Events', 'Private Dining', 'Atmosphere'],
      default: 'Food',
    },
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ category: 1, sortOrder: 1 });
GalleryImageSchema.index({ isPublished: 1 });

export const GalleryImage =
  mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
