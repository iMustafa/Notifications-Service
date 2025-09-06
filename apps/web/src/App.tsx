import React, { useState } from 'react';
import { type EventKey, type Channel } from '@pkg/core';
import { Toolbar } from './components/Toolbar';
import { EventForm } from './components/EventForm';
import { NotificationsList } from './components/NotificationsList';
import { useNotifications } from './hooks/useNotifications';
import { usePublish } from './hooks/usePublish';

export function App() {
  const [tenantId, setTenantId] = useState('t_demo');
  const [userId, setUserId] = useState('u_1');
  const { items, loading, reload } = useNotifications(userId);
  const { publish } = usePublish();

  function handleSubmit(params: { eventKey: EventKey; channel?: Channel; payload: Record<string, string | number> }) {
    publish({ eventKey: params.eventKey, tenantId, userId, payload: params.payload, channel: params.channel });
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Notifications POC</h2>
        <Toolbar tenantId={tenantId} setTenantId={setTenantId} userId={userId} setUserId={setUserId} onRefresh={reload} refreshing={loading} />
      </header>

      <section style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>Publish event</h3>
        <EventForm onSubmit={handleSubmit} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Latest notifications ({items.length})</h3>
        <NotificationsList items={items} />
      </section>
    </div>
  );
}

