import { apiFetch } from './client.js';

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Staff';
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ success: boolean; data: { user: AdminUserDto; token: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiFetch<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    apiFetch<{ success: boolean; data: { user: AdminUserDto } }>('/api/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ success: boolean; message: string }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
