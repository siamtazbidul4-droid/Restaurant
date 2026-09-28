import mongoose, { Schema, Document } from 'mongoose';

export interface IOpeningDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  lunchOpenTime?: string;
  lunchCloseTime?: string;
}

export interface IRestaurantSettings extends Document {
  restaurantName: string;
  tagline: string;
  description: string;
  heroHeadline: string;
  heroSubheadline: string;
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  mapUrl: string;
  latitude: number;
  longitude: number;
  parkingInformation: string;
  dressCode: string;
  openingHours: IOpeningDay[];
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultReservationDuration: number; // in minutes
  maxPartySizeOnline: number;
  minAdvanceNoticeHours: number;
  maxAdvanceNoticeDays: number;
  reservationPolicy: string;
  cancellationPolicy: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    michelinGuide?: string;
  };
  blockedDates: string[]; // YYYY-MM-DD
  cloudinaryConfig?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OpeningDaySchema = new Schema<IOpeningDay>({
  day: { type: String, required: true },
  isClosed: { type: Boolean, default: false },
  openTime: { type: String, default: '17:30' },
  closeTime: { type: String, default: '23:00' },
  lunchOpenTime: { type: String },
  lunchCloseTime: { type: String },
});

const RestaurantSettingsSchema = new Schema<IRestaurantSettings>(
  {
    restaurantName: { type: String, default: 'AURELIA' },
    tagline: { type: String, default: 'Contemporary Haute Cuisine & Fine Dining' },
    description: { type: String, default: 'An intimate culinary sanctuary presenting modern gastronomic artistry, guided by hyper-seasonal ingredients and architectural precision.' },
    heroHeadline: { type: String, default: 'An Elevated Dining Experience' },
    heroSubheadline: { type: String, default: 'Contemporary cuisine. Exceptional ingredients. Unforgettable moments.' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    phone: { type: String, default: '+1 (212) 555-0198' },
    email: { type: String, default: 'concierge@aurelia-dining.com' },
    address: { type: String, default: '442 Mayfair Boulevard, Upper East Side' },
    city: { type: String, default: 'New York' },
    postalCode: { type: String, default: '10021' },
    country: { type: String, default: 'United States' },
    mapUrl: { type: String, default: 'https://maps.google.com' },
    latitude: { type: Number, default: 40.768 },
    longitude: { type: Number, default: -73.965 },
    parkingInformation: { type: String, default: 'Complimentary private valet parking available at the grand porte-cochère entrance.' },
    dressCode: { type: String, default: 'Smart elegant attire requested. Jackets recommended for gentlemen; athletic wear is not permitted.' },
    openingHours: { type: [OpeningDaySchema], default: [] },
    currency: { type: String, default: 'USD' },
    currencySymbol: { type: String, default: '$' },
    timezone: { type: String, default: 'America/New_York' },
    defaultReservationDuration: { type: Number, default: 90 },
    maxPartySizeOnline: { type: Number, default: 8 },
    minAdvanceNoticeHours: { type: Number, default: 2 },
    maxAdvanceNoticeDays: { type: Number, default: 60 },
    reservationPolicy: { type: String, default: 'Reservations are held for up to 15 minutes past the scheduled seating time. Please notify our host team of any changes.' },
    cancellationPolicy: { type: String, default: 'We graciously request at least 24 hours advance notice for cancellations or modifications.' },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com' },
      facebook: { type: String, default: 'https://facebook.com' },
      michelinGuide: { type: String, default: 'https://guide.michelin.com' },
    },
    blockedDates: { type: [String], default: [] },
    cloudinaryConfig: {
      cloudName: { type: String },
      apiKey: { type: String },
      apiSecret: { type: String },
    },
  },
  { timestamps: true }
);

export const RestaurantSettings =
  mongoose.models.RestaurantSettings || mongoose.model<IRestaurantSettings>('RestaurantSettings', RestaurantSettingsSchema);
