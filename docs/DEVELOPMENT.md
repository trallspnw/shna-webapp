# Development

This doc describes how to run SHNA locally.

> **Goal:** run **Postgres in Docker** and run **Payload/Next** on your host machine.

## Repo layout

```
apps/
  cms/   # Payload CMS app (admin + API + preview)
  site/  # Static export site app (Cloudflare Pages)
packages/
  shared/ # Shared blocks, types, and frontend components
```

## Prerequisites

* Node + pnpm (repo uses pnpm)
* Docker + Docker Compose
* (Optional) Stripe CLI (only needed when working on webhooks)

## Quick start

1. Install deps

```bash
pnpm install
```

2. Configure environment

Copy `.env.example` (or create `.env`) in the repo root and set at least:

```env
DATABASE_URL=postgresql://payload:payload@localhost:5432/payload
PAYLOAD_SECRET=YOUR_SECRET_HERE
NEXT_PUBLIC_CMS_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
CRON_SECRET=YOUR_CRON_SECRET_HERE
PREVIEW_SECRET=YOUR_SECRET_HERE
CMS_INTERNAL_URL=http://localhost:3000
```

`CMS_INTERNAL_URL` is optional; use it on server hosts (e.g., Fly) to point server-side CMS fetches to an internal address.

For Fly + Supabase, use the Supabase **Session pooler** connection string format:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
```

3. Start local Postgres (Docker) + start CMS dev server (host)

```bash
pnpm dev:full
```

* Postgres runs in Docker via `compose.dev.yml`
* The app runs on your host at `http://localhost:3000`

4. (Optional) Start the static site dev server

```bash
pnpm dev:site
```

* The static site runs at `http://localhost:3001`
* It reads content from `NEXT_PUBLIC_CMS_URL`

Note: workspace scripts load the repo-root `.env` via `dotenv-cli`, so you do not need per-app `.env` files under `apps/cms` or `apps/site`.

## Test Mode (Ops Testing)

* **Definition:** Operational records created/handled in the same deployment and DB, flagged with `isTest: true`.
* **Activation:** Append `?mode=test` to URLs.
* **Persistence:** Once enabled, test mode remains active for the browsing session and is carried across internal links.
* **Stripe:** Use Stripe test keys (and test webhook secret when applicable) when test mode is active.
* **Admin:** Provide a **Show test data** filter and a **Delete all test records** action when viewing test data.

## Common commands

### App

* Start CMS dev server (host)

  ```bash
  pnpm dev
  ```

* Start site dev server (host)

  ```bash
  pnpm dev:site
  ```

* Export static site (copies CMS media into the site first)

  ```bash
  pnpm export:site
  ```

* Export and serve static site on port 3001

  ```bash
  pnpm export:site:serve
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

* Sync prod DB into local Postgres (destructive; local only)

  ```bash
  PROD_DATABASE_URL=postgresql://... pnpm db:sync:prod
  ```

  Requirements:
  * `PROD_DATABASE_URL` set in `.env` (Supabase Session pooler string)
  * Local Postgres running via `pnpm deps:up`
  * `pg_dump`, `pg_restore`, and `psql` available on your PATH

### Codegen

When you change collections/globals/fields, run:

```bash
pnpm codegen
```

This runs:

* `payload generate:types`
* `payload generate:importmap`

> You do **not** need to run codegen on every startup. Run it when schema/config or admin component paths change.

Generated types are written to `packages/shared/src/payload-types.ts`.

## Contribution checklist

- Read `AGENTS.md` and `docs/ARCHITECTURE.md` before making changes.
- Update docs when behavior or workflows change (see `AGENTS.md` doc hierarchy).
- Run `pnpm codegen` after schema/config or admin component path changes.
- Run relevant tests when you touch core logic or UI (`pnpm test` for full suite).

## Static export (site)

Build a static export (outputs `apps/site/out`):

```bash
pnpm export:site
```

This build reads content from the CMS HTTP API (`NEXT_PUBLIC_CMS_URL`) at build time.
Make sure the CMS is reachable when you run the export.

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
* If something else is using `3000`, set `PORT` and update `NEXT_PUBLIC_CMS_URL`.
* If `NEXT_PUBLIC_SITE_URL` is unset, sitemaps will default to `https://example.com`.

## Guardrails reminder

* **Public site remains static-first** — avoid changes that require request-time Node rendering for the public site.
* **Database is Postgres** (`@payloadcms/db-postgres`). Do not reintroduce Mongo examples.
