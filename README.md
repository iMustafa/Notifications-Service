## Notifications service (Express + Postgres + RabbitMQ + Redis)

Quick start:

1. Copy `.env.example` to `.env` and adjust if needed.
2. Install deps: `pnpm install`
3. Start infra (install locally or via Docker if available).
4. Seed DB: `pnpm seed`
5. Run services:
   - API: `pnpm dev:api`
   - Orchestrator: `pnpm dev:orchestrator`
   - Workers: `pnpm dev:worker-email`, `pnpm dev:worker-inapp` (sms/push optional)
   - Web GUI: `pnpm dev:web` → open `http://localhost:5173`

What this includes:

- API service (Express):
  - `POST /events` accepts DomainEvents and writes to Outbox
  - `GET /notifications?userId=` lists latest notifications
  - Background outbox publisher publishes to `events.exchange`
- Orchestrator:
  - Consumes events, resolves routing (simple map), preferences, rate limits
  - Emits channel-specific DeliveryJobs to `jobs.exchange`
- Workers:
  - Email worker renders template and writes `notifications` + `delivery_status`
  - In-app worker writes to `notifications` and publishes a Redis channel (stub)
- Web GUI:
  - Publish `billing.invoice.created` and view notifications per user

Architecture (high-level):

- Events → Outbox → RabbitMQ `events.exchange` → Orchestrator → `jobs.exchange` per-channel queues → Workers → DB writes.
- Preferences, rate limits, and quiet hours are checked in the orchestrator. Templates are versioned in Postgres.

Data model (Postgres): see `migrations/001_init.sql` for tables: tenants, users, channel_preferences, template_overrides, templates, notifications, delivery_status, outbox.

Seeding:

`pnpm seed` loads:
- Tenant `t_demo`
- Users: `u_1` (UTC), `u_2` (PST w/ quiet hours)
- Channel preferences for both users
- Template overrides: disable `billing.invoice.created` for `u_2`
- Templates: invoice (email/inapp) and password reset (email/sms)

End-to-end test:

1. Run services and web GUI
2. In the GUI, set `tenantId: t_demo`, `userId: u_1`
3. Publish invoice event → email worker writes records
4. Refresh notifications list to see entries

Docker quick start:

1. Ensure Docker Desktop is running
2. Create `.env` with Docker hostnames:
   
   ```env
   POSTGRES_URL=postgres://postgres:postgres@postgres:5432/notifications
   REDIS_URL=redis://redis:6379/0
   RABBIT_URL=amqp://guest:guest@rabbitmq:5672
   APP_PORT=8080
   RUN_PUBLISHER=1
   LOG_LEVEL=info
   ```

3. Bring up infra:
   
   ```bash
   docker compose up -d postgres redis rabbitmq
   ```

   Postgres applies `migrations/001_init.sql` on first init via `/docker-entrypoint-initdb.d`.

4. Seed DB:
   
   ```bash
   docker compose run --rm api sh -lc "corepack pnpm install && pnpm seed"
   ```

5. Start services:
   
   ```bash
   docker compose up -d api orchestrator worker-email worker-inapp
   # optionally add: worker-sms worker-push
   ```

6. Run the Web UI (Docker):
   
   ```bash
   docker compose up -d web
   ```
   
   - Open `http://localhost:5173`
   - The UI proxies to the API via `VITE_API_URL` (set to `http://api:8080` in compose)

7. Test via API:
   
   ```bash
   curl -X POST http://localhost:8080/events \
     -H 'Content-Type: application/json' \
     -d '{
       "name":"billing.invoice.created",
       "occurredAt":"2025-01-01T00:00:00Z",
       "tenantId":"t_demo",
       "targets":{"userIds":["u_1"]},
       "payload":{"invoiceId":"inv_9","amount":120.5,"currency":"USD"}
     }'
   
   curl "http://localhost:8080/notifications?userId=u_1"
   ```

8. RabbitMQ UI: `http://localhost:15672` (guest/guest)

