# Development

This doc describes how to run SHNA locally.

> **Goal:** run **Postgres in Docker** and run **Payload/Next** on your host machine.

## Prerequisites

* Node + pnpm (repo uses pnpm)
* Docker + Docker Compose
* (Optional) Stripe CLI (only needed when working on webhooks)

## Quick start

1. Install deps

```bash
pnpm ii
```

2. Configure environment

Copy `.env.example` (or create `.env`) and set at least:

```env
DATABASE_URL=postgresql://payload:payload@localhost:5432/payload
PAYLOAD_SECRET=YOUR_SECRET_HERE
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=YOUR_CRON_SECRET_HERE
PREVIEW_SECRET=YOUR_SECRET_HERE
```

3. Start local Postgres (Docker) + start dev server (host)

```bash
pnpm dev:full
```

* Postgres runs in Docker via `compose.dev.yml`
* The app runs on your host at `http://localhost:3000`

## Common commands

### App

* Start dev server (host)

  ```bash
  pnpm dev
  ```

* Start deps only (Docker)

  ```bash
  pnpm deps:up
  ```

* Stop deps

  ```bash
  pnpm deps:down
  ```

* Tail Postgres logs

  ```bash
  pnpm deps:logs
  ```

### Codegen

When you change collections/globals/fields, run:

```bash
pnpm codegen
```

This runs:

* `payload generate:types`
* `payload generate:importmap`

> You do **not** need to run codegen on every startup. Run it when schema/config or admin component paths change.

## Contribution checklist

- Read `AGENTS.md` and `docs/ARCHITECTURE.md` before making changes.
- Update docs when behavior or workflows change (see `AGENTS.md` doc hierarchy).
- Run `pnpm codegen` after schema/config or admin component path changes.
- Run relevant tests when you touch core logic or UI (`pnpm test` for full suite).

## Database

### Docker compose

Local Postgres is defined in `compose.dev.yml` and persists data via a named volume.

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: payload
      POSTGRES_DB: payload
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Resetting the database (destructive)

If Postgres fails to start due to a volume mismatch (e.g., you previously ran a different Postgres major version), or you just want a clean slate:

```bash
pnpm deps:reset
```

This removes the named volume and all local DB data.

## Stripe (optional)

Only needed when implementing webhook-driven features.

### Login

```bash
pnpm stripe:login
```

### Forward webhooks to local

Run this in a separate terminal:

```bash
pnpm stripe:listen
```

This forwards Stripe webhooks to:

* `http://localhost:3000/api/stripe/webhook`

## Troubleshooting

### Postgres: “database files are incompatible”

You are reusing a data volume created by a different Postgres major version.

Fix (destructive):

```bash
pnpm deps:reset
pnpm deps:up
```

### Port conflicts

* If something else is using `5432`, change the host port in `compose.dev.yml`.
* If something else is using `3000`, set `PORT` and update `NEXT_PUBLIC_SERVER_URL`.

## Guardrails reminder

* **Public site remains static-first** — avoid changes that require request-time Node rendering for the public site.
* **Database is Postgres** (`@payloadcms/db-postgres`). Do not reintroduce Mongo examples.
