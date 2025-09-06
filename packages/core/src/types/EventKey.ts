import { AuthEventKeys } from '../events/auth/_authEventKeys';
import { BillingEventKeys } from '../events/billing/_billingEventKeys';

export type EventKey =
  AuthEventKeys |
  BillingEventKeys;
  