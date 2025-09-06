import { z } from 'zod';
import { EventKey } from '../types/EventKey';
import { EventDefinition } from '../types/EventDefinition';

import { invoiceCreated, invoiceCreatedPayload } from "./billing/invoiceCreated";
import { passwordResetRequested, passwordResetRequestedPayload } from "./auth/passwordResetRequested";
import { passwordResetConfirmed, passwordResetConfirmedPayload } from "./auth/passwordResetConfirmed";

export type EventPayloadMap = {
  'billing.invoice.created': z.infer<typeof invoiceCreatedPayload>;
  'auth.password.reset.requested': z.infer<typeof passwordResetRequestedPayload>;
  'auth.password.reset.confirmed': z.infer<typeof passwordResetConfirmedPayload>;
};

export const eventDefinitions = {
  'billing.invoice.created': invoiceCreated,
  'auth.password.reset.requested': passwordResetRequested,
  'auth.password.reset.confirmed': passwordResetConfirmed
} satisfies Record<EventKey, EventDefinition<any>>;
