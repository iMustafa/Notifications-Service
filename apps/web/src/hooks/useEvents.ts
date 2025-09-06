import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventDefinitions, type EventKey, type Channel } from '@pkg/core';

export type FormState = Record<string, string | number>;

export function useEvents(initial: EventKey = 'billing.invoice.created') {
  const [eventKey, setEventKey] = useState<EventKey>(initial);
  const def = useMemo(() => eventDefinitions[eventKey], [eventKey]);
  const [channel, setChannel] = useState<Channel | ''>('');
  const [form, setForm] = useState<FormState>(() => {
    const initialState: FormState = {};
    def.uiFields.forEach(f => {
      initialState[f.key as string] = (f.defaultValue ?? '') as string | number;
    });
    return initialState;
  });

  useEffect(() => {
    const next: FormState = {};
    def.uiFields.forEach(f => {
      next[f.key as string] = (f.defaultValue ?? '') as string | number;
    });
    setForm(next);
    setChannel('');
  }, [def]);

  const setField = useCallback((key: string, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  return { eventKey, setEventKey, def, channel, setChannel, form, setField };
}

