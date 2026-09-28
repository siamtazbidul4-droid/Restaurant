import { apiFetch } from './client.js';

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  availableSlots: string[];
  daySchedule?: {
    day: string;
    open: string;
    close: string;
  };
}

export interface ReservationPayload {
  date: string;
  time: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequest?: string;
  seatingPreference?: string;
  dietaryRequirements?: string[];
  source?: 'Website' | 'Phone' | 'Walk-in' | 'Admin';
  tableId?: string;
  status?: string;
}

export const reservationsApi = {
  checkAvailability: (date: string, guests: number) =>
    apiFetch<{ success: boolean; data: AvailabilityResult }>(
      `/api/reservations/availability?date=${encodeURIComponent(date)}&guests=${guests}`
    ),

  createReservation: (data: ReservationPayload) =>
    apiFetch<{ success: boolean; data: any; message: string }>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  lookupByReference: (reference: string) =>
    apiFetch<{ success: boolean; data: any }>(`/api/reservations/lookup/${encodeURIComponent(reference)}`),

  cancelByReference: (reference: string, reason?: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/reservations/lookup/${encodeURIComponent(reference)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Admin endpoints
  getAllAdmin: (params?: { date?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/api/reservations/admin/all?${query.toString()}`);
  },

  createAdminReservation: (data: ReservationPayload) =>
    apiFetch<{ success: boolean; data: any; message: string }>('/api/reservations/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAdminReservation: (id: string, data: any) =>
    apiFetch<{ success: boolean; data: any; message: string }>(`/api/reservations/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAdminReservation: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/reservations/admin/${id}`, {
      method: 'DELETE',
    }),
};
