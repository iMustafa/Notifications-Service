import { eventDefinitions } from "../events/index";
import type { EventKey } from "../types/EventKey";
import type { EventDefinition } from "../types/EventDefinition";

export function getEventDefinition<K extends EventKey>(key: K): EventDefinition<K> {
  if (!(key in eventDefinitions)) {
    throw new Error(`Event definition not found for key: ${key}`);
  }
  return eventDefinitions[key] as unknown as EventDefinition<K>;
}
