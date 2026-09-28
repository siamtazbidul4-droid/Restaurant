import mongoose, { Schema, Document } from 'mongoose';

export interface IChef extends Document {
  name: string;
  position: string;
  experience: string;
  biography: string;
  culinaryPhilosophy: string;
  specialties: string[];
  image: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChefSchema = new Schema<IChef>(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, default: 'Executive Chef & Culinary Director' },
    experience: { type: String, default: '18+ Years of Classical French & Modern Scandinavian Gastronomy' },
    biography: { type: String, required: true },
    culinaryPhilosophy: { type: String, required: true },
    specialties: { type: [String], default: [] },
    image: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Chef = mongoose.models.Chef || mongoose.model<IChef>('Chef', ChefSchema);
