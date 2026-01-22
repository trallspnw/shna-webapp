#!/usr/bin/env bash
set -euo pipefail

max_attempts=30
sleep_seconds=2

for attempt in $(seq 1 "$max_attempts"); do
  if docker compose -f compose.dev.yml exec -T postgres pg_isready -U payload -d payload >/dev/null 2>&1; then
    echo "Postgres is ready"
    exit 0
  fi
  echo "Waiting for Postgres... ($attempt/$max_attempts)"
  sleep "$sleep_seconds"
done

echo "Postgres did not become ready in time"
exit 1
