import { useCallback, useState } from 'react';
import type { Channel, EventKey } from '@notifications/core';
import { useCreateEventMutation } from '../store/events';

export function usePublish() {
  const { mutateAsync, isPending } = useCreateEventMutation();

  const publish = useCallback(async (params: {
    eventKey: EventKey;
    tenantId: string;
    userId: string;
    payload: Record<string, string | number>;
    channel?: Channel;
  }) => {
    await mutateAsync({
      eventKey: params.eventKey,
      tenantId: params.tenantId,
      userId: params.userId,
      payload: params.payload,
      channel: params.channel
    });
  }, [mutateAsync]);

  return { publish, posting: isPending };
}

