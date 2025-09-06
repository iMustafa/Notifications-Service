import { http } from './http';
import type { NotificationItem } from '../hooks/useNotifications';

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  const { data } = await http.get('/notifications', { params: { userId } });
  return data.items ?? [];
}

