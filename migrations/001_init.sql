CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  email TEXT, phone TEXT,
  locale TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS channel_preferences (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','push','inapp')),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_hours JSONB NULL,
  PRIMARY KEY (tenant_id, user_id, channel)
);

CREATE TABLE IF NOT EXISTS template_overrides (
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  template_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (tenant_id, user_id, template_key)
);

CREATE TABLE IF NOT EXISTS templates (
  key TEXT NOT NULL,
  version INT NOT NULL,
  channel TEXT NOT NULL,
  locale TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  data_schema JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (key, version, channel, locale)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  channel TEXT NOT NULL,
  template_key TEXT NOT NULL,
  template_version INT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_status (
  id BIGSERIAL PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id),
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  code TEXT, message TEXT, meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outbox (
  id BIGSERIAL PRIMARY KEY,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON outbox(published) WHERE published = FALSE;

