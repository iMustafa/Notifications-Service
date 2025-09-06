import { z } from 'zod';
import type { Channel, ChannelPlan } from './index';

export type EventKey = 'billing.invoice.created' | 'auth.password.reset.requested';

// Payload schemas per event
export const invoiceCreatedPayload = z.object({
  invoiceId: z.string().min(1),
  amount: z.number(),
  currency: z.string().min(1)
});

export const passwordResetRequestedPayload = z.object({
  userEmail: z.string().email().optional(),
  code: z.string().min(4).max(12).optional()
});

export const eventPayloadSchemas: Record<EventKey, z.ZodTypeAny> = {
  'billing.invoice.created': invoiceCreatedPayload,
  'auth.password.reset.requested': passwordResetRequestedPayload
};

export type EventPayloadMap = {
  'billing.invoice.created': z.infer<typeof invoiceCreatedPayload>;
  'auth.password.reset.requested': z.infer<typeof passwordResetRequestedPayload>;
};

// UI field metadata for dynamic forms
export type UiFieldFor<K extends EventKey> = {
  key: keyof EventPayloadMap[K];
  label: string;
  type: 'text' | 'number' | 'email';
  placeholder?: string;
  defaultValue?: string | number;
};

export type EventDefinition<K extends EventKey> = {
  key: K;
  title: string;
  uiFields: UiFieldFor<K>[];
  defaultPlan: ChannelPlan;
  allowedChannels: Channel[];
  templateKey: string;
};

export const eventDefinitions: { [K in EventKey]: EventDefinition<K> } = {
  'billing.invoice.created': {
    key: 'billing.invoice.created',
    title: 'Invoice Created',
    uiFields: [
      { key: 'invoiceId', label: 'Invoice ID', type: 'text', placeholder: 'inv_123' },
      { key: 'amount', label: 'Amount', type: 'number', defaultValue: 120.5 },
      { key: 'currency', label: 'Currency', type: 'text', defaultValue: 'USD' }
    ],
    defaultPlan: { primary: 'email', fallbacks: ['inapp'], templateKey: 'billing.invoice.created', constraints: { quietHours: false, rateLimitBucket: 'invoice' } },
    allowedChannels: ['email', 'sms', 'push', 'inapp'],
    templateKey: 'billing.invoice.created'
  },
  'auth.password.reset.requested': {
    key: 'auth.password.reset.requested',
    title: 'Password Reset Requested',
    uiFields: [
      { key: 'userEmail', label: 'User Email', type: 'email', placeholder: 'user@example.com' },
      { key: 'code', label: 'Code', type: 'text', placeholder: '123456' }
    ],
    defaultPlan: { primary: 'email', fallbacks: ['sms'], templateKey: 'auth.password.reset', constraints: { quietHours: false } },
    allowedChannels: ['email', 'sms'],
    templateKey: 'auth.password.reset'
  }
};

export function getEventDefinition<K extends EventKey>(key: K): EventDefinition<K> {
  return eventDefinitions[key];
}

export type AnyEventPayload = EventPayloadMap[EventKey];
export type AnyEventPayloadKey = AnyEventPayload extends any ? keyof AnyEventPayload : never;

