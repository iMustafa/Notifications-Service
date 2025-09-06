import { http } from './http';
import type { Channel, EventKey } from '@pkg/core';

export async function createEvent(params: {
  eventKey: EventKey;
  tenantId: string;
  userId: string;
  payload: Record<string, string | number>;
  channel?: Channel;
}): Promise<void> {
  await http.post('/events', {
    name: params.eventKey,
    occurredAt: new Date().toISOString(),
    tenantId: params.tenantId,
    targets: { userIds: [params.userId] },
    payload: params.payload,
    overrides: params.channel ? { channelOverride: params.channel } : undefined
  });
}

