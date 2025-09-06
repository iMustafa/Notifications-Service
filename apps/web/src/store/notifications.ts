import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../api/notificationsApi';
import type { NotificationItem } from '../hooks/useNotifications';

export function useGetNotificationsQuery(userId: string) {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId),
    enabled: Boolean(userId),
    refetchInterval: 3000
  });
}

