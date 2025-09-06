import React from 'react';
import type { NotificationItem } from '../hooks/useNotifications';

export function NotificationsList(props: { items: NotificationItem[] }) {
  if (!props.items.length) return <div>No notifications yet.</div>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {props.items.map(n => (
        <div key={n.id} style={{ border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: 8, padding: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 12, color: '#2563eb' }}>{n.channel}</span>
            <span style={{ fontWeight: 500 }}>{n.template_key} v{n.template_version}</span>
            <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 12 }}>{new Date(n.created_at).toLocaleString()}</span>
          </div>
          <pre style={{ margin: 0, background: '#f9fafb', borderRadius: 6, padding: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(n.payload, null, 2)}</pre>
          <div style={{ marginTop: 6, fontSize: 12, color: '#374151' }}>Status: {n.status}</div>
        </div>
      ))}
    </div>
  );
}

