import { apiFetch } from './client.js';

export interface DiningTableDto {
  _id: string;
  tableNumber: string;
  capacity: number;
  type: 'standard' | 'window' | 'booth' | 'private_salon' | 'chefs_counter';
  zone: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export const tablesApi = {
  getTables: (all = true) =>
    apiFetch<{ success: boolean; data: DiningTableDto[] }>(`/api/tables${all ? '?all=true' : ''}`),

  createTable: (data: Partial<DiningTableDto>) =>
    apiFetch<{ success: boolean; data: DiningTableDto }>('/api/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTable: (id: string, data: Partial<DiningTableDto>) =>
    apiFetch<{ success: boolean; data: DiningTableDto }>(`/api/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTable: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/tables/${id}`, {
      method: 'DELETE',
    }),
};
