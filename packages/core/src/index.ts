import { EventKey } from './events';

export type Channel = 'email' | 'sms' | 'push' | 'inapp';

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

export type ChannelPlan = {
  primary: Channel;
  fallbacks?: Channel[];
  constraints?: { quietHours?: boolean; rateLimitBucket?: string };
  templateKey: string;
};

export type DeliveryJob = {
  jobId: string;
  eventId: string;
  tenantId: string;
  channel: Channel;
  plan: ChannelPlan;
  recipients: Array<{
    userId?: string;
    email?: string;
    phone?: string;
    pushTokens?: string[];
    locale?: string;
    timezone?: string;
  }>;
  data: Record<string, unknown>;
  priority: 'high' | 'normal' | 'low';
  traceId: string;
};

export type PublishOverrides = {
  channelOverride?: Channel; // force send via a specific channel
};

export { eventDefinitions, getEventDefinition, type EventDefinition, type EventKey, type EventPayloadMap, type AnyEventPayloadKey } from './events';

