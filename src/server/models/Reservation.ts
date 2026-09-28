import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  reference: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequest?: string;
  seatingPreference?: string;
  dietaryRequirements?: string[];
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'No-show' | 'Seated';
  source: 'Website' | 'Phone' | 'Walk-in' | 'Admin';
  table?: mongoose.Types.ObjectId;
  internalNotes?: string;
  cancellationReason?: string;
  // Future deposit fields:
  depositRequired: boolean;
  depositAmount: number;
  paymentStatus: 'none' | 'pending' | 'paid' | 'refunded';
  paymentProvider?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    reference: { type: String, required: true, unique: true, uppercase: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, default: 90 },
    guests: { type: Number, required: true, min: 1, max: 20 },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    specialRequest: { type: String, default: '', trim: true },
    seatingPreference: { type: String, default: 'Any' },
    dietaryRequirements: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-show', 'Seated'],
      default: 'Confirmed',
    },
    source: {
      type: String,
      enum: ['Website', 'Phone', 'Walk-in', 'Admin'],
      default: 'Website',
    },
    table: { type: Schema.Types.ObjectId, ref: 'DiningTable' },
    internalNotes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    depositRequired: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['none', 'pending', 'paid', 'refunded'],
      default: 'none',
    },
    paymentProvider: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

ReservationSchema.index({ date: 1, time: 1 });
ReservationSchema.index({ date: 1, status: 1 });
ReservationSchema.index({ email: 1 });
ReservationSchema.index({ table: 1, date: 1 });

export const Reservation =
  mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
