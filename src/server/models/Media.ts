import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType: string;
  folder?: string;
  altText: string;
  caption?: string;
  bytes?: number;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    publicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    resourceType: { type: String, default: 'image' },
    folder: { type: String, default: 'aurelia_restaurant' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    bytes: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MediaSchema.index({ createdAt: -1 });

export const Media = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
