import mongoose, { Schema, Document } from 'mongoose';

export interface IDiningTable extends Document {
  tableNumber: string;
  capacity: number;
  type: 'standard' | 'window' | 'booth' | 'private_salon' | 'chefs_counter';
  zone: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const DiningTableSchema = new Schema<IDiningTable>(
  {
    tableNumber: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: ['standard', 'window', 'booth', 'private_salon', 'chefs_counter'],
      default: 'standard',
    },
    zone: { type: String, default: 'Main Dining Hall' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DiningTableSchema.index({ isActive: 1, capacity: 1 });

export const DiningTable =
  mongoose.models.DiningTable || mongoose.model<IDiningTable>('DiningTable', DiningTableSchema);
