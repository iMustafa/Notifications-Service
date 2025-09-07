import { useGetNotificationsQuery } from '../store/notifications';

export type NotificationItem = {
  id: string;
  tenant_id: string;
  user_id: string;
  channel: string;
  template_key: string;
  template_version: number;
  payload: unknown;
  status: string;
  created_at: string;
};

export function useNotifications(userId: string) {
  const { data, isLoading, refetch } = useGetNotificationsQuery(userId);
  return { items: data ?? [], loading: isLoading, reload: refetch };
}

