import { apiFetch } from './client.js';

export interface ContactMessageDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Archived';
  internalNotes?: string;
  createdAt: string;
}

export const contactApi = {
  sendMessage: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    apiFetch<{ success: boolean; message: string; data: ContactMessageDto }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAdminMessages: (status?: string) =>
    apiFetch<{ success: boolean; data: ContactMessageDto[] }>(
      `/api/contact/admin${status ? `?status=${encodeURIComponent(status)}` : ''}`
    ),

  updateMessage: (id: string, data: { status: string; internalNotes?: string }) =>
    apiFetch<{ success: boolean; data: ContactMessageDto }>(`/api/contact/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMessage: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/contact/admin/${id}`, {
      method: 'DELETE',
    }),
};
