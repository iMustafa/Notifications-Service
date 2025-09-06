import { z } from 'zod';
import { EventKey } from '../types/EventKey';
import { EventDefinition } from '../types/EventDefinition';

import { invoiceCreated, invoiceCreatedPayload } from "./billing/invoiceCreated";
import { passwordResetRequested, passwordResetRequestedPayload } from "./auth/passwordResetRequested";

export type EventPayloadMap = {
  'billing.invoice.created': z.infer<typeof invoiceCreatedPayload>;
  'auth.password.reset.requested': z.infer<typeof passwordResetRequestedPayload>;
};

export const eventDefinitions = {
  'billing.invoice.created': invoiceCreated,
  'auth.password.reset.requested': passwordResetRequested
} satisfies Record<EventKey, EventDefinition<any>>;
