import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '../api/eventsApi';
import type { Channel, EventKey } from '@notifications/core';

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { eventKey: EventKey; tenantId: string; userId: string; payload: Record<string, string | number>; channel?: Channel }) =>
      createEvent(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

