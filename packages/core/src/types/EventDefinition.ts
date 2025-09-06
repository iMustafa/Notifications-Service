import { EventPayloadMap } from '../events';
import type { EventKey } from './EventKey';
import type { ChannelPlan } from './ChannelPlan';
import type { Channel } from './Channel';

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