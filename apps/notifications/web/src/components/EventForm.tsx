import React from 'react';
import type { Channel, EventKey } from '@notifications/core';
import { eventDefinitions } from '@notifications/core';
import { useEvents } from '../hooks/useEvents';

export function EventForm(props: {
  onSubmit: (params: { eventKey: EventKey; channel?: Channel; payload: Record<string, string | number> }) => Promise<void> | void;
}) {
  const { eventKey, setEventKey, def, channel, setChannel, form, setField } = useEvents();

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <label>Event
          <select value={eventKey} onChange={e => setEventKey(e.target.value as EventKey)}>
            {Object.values(eventDefinitions).map(ed => (
              <option key={ed.key} value={ed.key}>{ed.title}</option>
            ))}
          </select>
        </label>
        <label>Channel (optional override)
          <select value={channel} onChange={e => setChannel(e.target.value as Channel)}>
            <option value="">(auto)</option>
            {def.allowedChannels.map(ch => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {def.uiFields.map(f => (
          <label key={f.key as string} style={{ display: 'grid' }}>{f.label}
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              placeholder={f.placeholder}
              value={form[f.key as string] ?? ''}
              onChange={e => setField(f.key as string, f.type === 'number' ? Number(e.target.value) : e.target.value)}
            />
          </label>
        ))}
      </div>
      <div>
        <button onClick={() => props.onSubmit({ eventKey, channel: channel || undefined, payload: form })}>Publish</button>
      </div>
    </div>
  );
}

