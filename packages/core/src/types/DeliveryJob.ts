import type { Channel } from "./Channel";
import type { ChannelPlan } from "./ChannelPlan";

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