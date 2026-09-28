import { apiFetch } from './client.js';

export interface OpeningDayDto {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

export interface RestaurantSettingsDto {
  _id: string;
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
  openingHours: OpeningDayDto[];
  currency: string;
  currencySymbol: string;
  timezone: string;
  defaultReservationDuration: number;
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
  blockedDates: string[];
}

export const settingsApi = {
  getSettings: () =>
    apiFetch<{ success: boolean; data: RestaurantSettingsDto }>('/api/settings'),

  updateSettings: (data: Partial<RestaurantSettingsDto>) =>
    apiFetch<{ success: boolean; data: RestaurantSettingsDto; message: string }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
