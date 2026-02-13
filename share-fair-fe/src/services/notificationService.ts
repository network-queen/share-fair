import api from './api';
import type { NotificationItem } from '../types';

class NotificationService {
  async getNotifications(limit: number = 20, offset: number = 0): Promise<NotificationItem[]> {
    const response = await api.get<NotificationItem[]>('/notifications', {
      params: { limit, offset },
    });
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get<number>('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }
}

export default new NotificationService();
