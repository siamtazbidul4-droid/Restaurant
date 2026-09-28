import { apiFetch } from './client.js';

export interface DashboardStatsDto {
  todayReservationsCount: number;
  pendingReservationsCount: number;
  upcomingReservationsCount: number;
  newEventInquiriesCount: number;
  unreadContactMessagesCount: number;
  totalMenuItemsCount: number;
  recentActivity: Array<{
    _id: string;
    actor: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: any;
    timestamp: string;
  }>;
}

export interface NotificationDto {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const adminApi = {
  getDashboardStats: () =>
    apiFetch<{ success: boolean; data: DashboardStatsDto }>('/api/admin/dashboard-stats'),

  getNotifications: () =>
    apiFetch<{ success: boolean; data: { notifications: NotificationDto[]; unreadCount: number } }>(
      '/api/admin/notifications'
    ),

  markNotificationRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    apiFetch<{ success: boolean }>('/api/admin/notifications/read-all', {
      method: 'PUT',
    }),

  getAuditLogs: (params?: { resource?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.resource) q.set('resource', params.resource);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return apiFetch<{ success: boolean; data: any[]; pagination: any }>(`/api/admin/audit-logs?${q.toString()}`);
  },
};
