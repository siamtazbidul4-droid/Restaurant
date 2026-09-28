import { apiFetch } from './client.js';

export interface PrivateEventInquiryDto {
  _id: string;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  guestCount: number;
  preferredDate: string;
  preferredTime: string;
  budgetRange?: string;
  specialRequirements?: string;
  message?: string;
  status: string;
  internalNotes?: string;
  createdAt: string;
}

export const eventsApi = {
  submitInquiry: (data: any) =>
    apiFetch<{ success: boolean; message: string; data: PrivateEventInquiryDto }>('/api/events/inquire', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAdminInquiries: (status?: string) =>
    apiFetch<{ success: boolean; data: PrivateEventInquiryDto[] }>(
      `/api/events/admin${status ? `?status=${encodeURIComponent(status)}` : ''}`
    ),

  updateInquiry: (id: string, data: { status: string; internalNotes?: string }) =>
    apiFetch<{ success: boolean; data: PrivateEventInquiryDto }>(`/api/events/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteInquiry: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/events/admin/${id}`, {
      method: 'DELETE',
    }),
};
