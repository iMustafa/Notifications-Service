import { z } from 'zod';
import { EventDefinition } from '../../types/EventDefinition';

export const invoiceCreated: EventDefinition<'billing.invoice.created'> = {
  key: 'billing.invoice.created',
  title: 'Invoice Created',
  uiFields: [
    {
      key: 'invoiceId',
      label: 'Invoice ID',
      type: 'text',
      placeholder: 'inv_123'
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'number',
      defaultValue: 120.5
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'text',
      defaultValue: 'USD'
    }
  ],
  defaultPlan: {
    primary: 'email',
    fallbacks: ['inapp'],
    templateKey: 'billing.invoice.created',
    constraints: {
      quietHours: false,
      rateLimitBucket: 'invoice'
    }
  },
  allowedChannels: ['email', 'sms', 'push', 'inapp'],
  templateKey: 'billing.invoice.created'
}

export const invoiceCreatedPayload = z.object({
  invoiceId: z.string().min(1),
  amount: z.number(),
  currency: z.string().min(1)
});
