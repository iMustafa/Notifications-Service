import type { Channel } from '@pkg/core';
import type { EventKey } from '@pkg/core';

export type TemplateSeed = {
  key: EventKey;
  version: number;
  channel: Channel;
  locale: string;
  subject?: string;
  body: string;
};

