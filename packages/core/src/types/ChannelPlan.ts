import type { Channel } from './Channel';

export type ChannelPlan = {
  primary: Channel;
  fallbacks?: Channel[];
  constraints?: { quietHours?: boolean; rateLimitBucket?: string };
  templateKey: string;
};