#!/usr/bin/env bash
set -euo pipefail

# Move to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Select docker compose binary
if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  COMPOSE="docker compose"
fi

# Ensure .env exists with Docker defaults
if [ ! -f ".env" ]; then
  cat > .env <<'EOF'
POSTGRES_URL=postgres://postgres:postgres@postgres:5432/notifications
REDIS_URL=redis://redis:6379/0
RABBIT_URL=amqp://guest:guest@rabbitmq:5672
APP_PORT=8080
RUN_PUBLISHER=1
LOG_LEVEL=info
EOF
  echo "Created .env with Docker defaults."
fi

echo "Starting core infra (postgres, redis, rabbitmq)..."
$COMPOSE up -d postgres redis rabbitmq

echo "Waiting for Postgres to be ready..."
attempts=60
i=0
until $COMPOSE exec -T postgres sh -c "pg_isready -U postgres -h localhost" >/dev/null 2>&1; do
  i=$((i+1))
  if [ $i -ge $attempts ]; then
    echo "Postgres not ready after $attempts seconds." >&2
    exit 1
  fi
  sleep 1
done
echo "Postgres is ready."

echo "Seeding database..."
$COMPOSE run --rm api sh -lc "PNPM_YES=true corepack pnpm install && PNPM_YES=true corepack pnpm dlx tsx packages/db/src/seed.ts"

echo "Starting services (api, orchestrator, workers, web)..."
$COMPOSE up -d api orchestrator worker-email worker-inapp web

echo "All services started."
echo "API:       http://localhost:8080"
echo "Web UI:    http://localhost:5173"
echo "RabbitMQ:  http://localhost:15672 (guest/guest)"

