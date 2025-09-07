import React from 'react';

export function Toolbar(props: {
  tenantId: string;
  setTenantId: (v: string) => void;
  userId: string;
  setUserId: (v: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
      <label style={{ display: 'grid' }}>Tenant
        <input value={props.tenantId} onChange={e => props.setTenantId(e.target.value)} />
      </label>
      <label style={{ display: 'grid' }}>User ID
        <input value={props.userId} onChange={e => props.setUserId(e.target.value)} />
      </label>
      <button onClick={props.onRefresh} disabled={props.refreshing}>Refresh</button>
    </div>
  );
}

