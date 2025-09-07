import type { Channel } from './Channel';
import type { EventKey } from './EventKey';

export type PublishOverrides = {
  channelOverride?: Channel; // force send via a specific channel
};

export type DomainEvent = {
  id: string;
  name: EventKey;
  occurredAt: string;
  tenantId: string;
  targets: { userIds?: string[]; emails?: string[]; phones?: string[] };
  payload: Record<string, unknown>;
  dedupeKey?: string;
  priority?: 'high' | 'normal' | 'low';
  traceId?: string;
  overrides?: PublishOverrides;
};