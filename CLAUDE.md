# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SHNA (Friends of Seminary Hill Natural Area) — a small nonprofit's website and membership system. Full docs live in `docs/`.

## Commands

All commands run from the repo root with `pnpm`. The root `.env` is loaded automatically via `dotenv-cli`.

### Development

```bash
pnpm dev:full        # Start Docker Postgres + CMS dev server (localhost:3000)
pnpm dev             # CMS only (Postgres must already be running)
pnpm dev:site        # Static site dev server (localhost:3001)
pnpm deps:up         # Start Docker Postgres only
pnpm deps:down       # Stop Docker Postgres
pnpm deps:reset      # Destroy Postgres volume (destructive, fixes version mismatch)
```

### Codegen (run after any schema/collection/global/field change)

```bash
pnpm codegen         # payload generate:types + payload generate:importmap
```

Generated types output to `packages/shared/src/payload-types.ts`.

### Testing

```bash
pnpm test            # Run [core]-tagged integration tests (also starts Postgres)
pnpm test:all        # All integration + unit tests
pnpm test:future     # [future]-tagged tests only
```

Tests are in `apps/cms/tests/`. Integration tests use the local Postgres DB directly via the Payload Local API. Unit tests use `vitest` with `jsdom`. Tests run single-threaded (`singleThread: true`).

To run a single test file:
```bash
cd apps/cms && pnpm exec vitest run tests/unit/services/memberships.service.test.ts
```

### Building & Export

```bash
pnpm build:cms       # Build Payload/Next CMS
pnpm export:site     # Static export of public site → apps/site/out/
pnpm export:site:serve  # Export + serve at localhost:3001
pnpm lint            # ESLint on CMS app
```

### Stripe (webhook dev only)

```bash
pnpm stripe:listen   # Forward Stripe webhooks to localhost:3000/api/stripe/webhooks
```

## Architecture

### Monorepo layout

```
apps/cms/      — Payload CMS: admin UI, REST/GraphQL API, webhooks, preview (Fly.io)
apps/site/     — Static export site: Next.js → Cloudflare Pages
packages/shared/ — Shared: Payload block configs, React components, types, utilities
```

### Two apps, one backend

The **CMS** (`apps/cms`) is the sole backend. It serves:
- Payload admin at `/admin`
- REST + GraphQL APIs
- Custom public endpoints: `/api/public/subscriptions/submit`, `/api/public/donations/submit`, `/api/public/memberships/submit`, `/api/public/orders/status`
- Custom admin endpoints: `/api/admin/donations/submit`, `/api/admin/memberships/submit`
- Stripe webhook: `/api/stripe/webhooks`

The **site** (`apps/site`) is a statically exported Next.js app. It fetches all content at build time from `NEXT_PUBLIC_CMS_URL`. **No request-time Node server is used for public pages.** All public routes must remain statically exportable.

### Shared package (`packages/shared`)

Block configs (for Payload) and their React components live together in `packages/shared/src/blocks/`. Globals (Header, Footer, SiteSettings, DonationsSettings) also define their configs here. This package is consumed by both apps.

### Data model (Payload collections)

**Content:** Pages, Media
**Ops:** Contacts, Campaigns, SubscriptionTopics, Subscriptions, MembershipPlans, Memberships, Orders, OrderItems, Transactions, EmailTemplates, EmailSends
**Auth:** Users
**Globals:** Header, Footer, SiteSettings, DonationsSettings

Operational collections include `isTest: boolean` to flag test records (see Test Mode below).

### Service layer

Business logic lives in `apps/cms/src/services/`:
- `memberships/` — membership creation, Stripe checkout, webhook processing
- `donations/` — donation flow
- `orders/` — order status
- `subscriptions/` — email list subscribe/unsubscribe
- `email/` — transactional email rendering and delivery
- `campaigns/` — campaign resolution

Integrations (`apps/cms/src/integrations/`) wrap external SDKs: `brevo/` for email, `stripe/` for payments.

### Localization

Routes use explicit prefixes: `/en/*` and `/es/*`. Payload is configured with `locales: ['en', 'es']` and `fallback: true`. Slugs are not localized. Links must always include the locale prefix. The locale utility (`packages/shared/src/utilities/locale.ts`) powers root and share routing.

### Media

Uploads go to **Cloudflare R2** via `@payloadcms/storage-s3`. Public site references CDN URLs directly (`NEXT_PUBLIC_MEDIA_ORIGIN`). For local dev, set `R2_PREFIX=local/<your-name>`.

## Critical Payload patterns

### Local API access control

Local API **bypasses access control by default**. When acting on behalf of a user:

```typescript
// ✅ REQUIRED when passing user
await payload.find({ collection: 'posts', user: someUser, overrideAccess: false })
```

### Transaction safety in hooks

Always pass `req` to nested operations inside hooks to maintain atomicity:

```typescript
await req.payload.create({ collection: 'audit-log', data: {...}, req })
```

### Prevent hook loops

Use `req.context` flags:

```typescript
if (context.skipHooks) return
await req.payload.update({ ..., context: { skipHooks: true }, req })
```

## Test mode

Test mode is **not a separate environment** — it uses the same production deployment and database. Records are flagged with `isTest: true`.

- **Activation:** append `?mode=test` to any URL; persists for the session
- **Stripe:** switches to test keys automatically
- **Email:** subjects auto-prefixed with `[TEST]`
- **Admin:** "Show test data" filter + "Delete all test records" action

## Key env vars

| Variable | Used by |
|---|---|
| `DATABASE_URL` | CMS — Supabase Session pooler string in prod |
| `PAYLOAD_SECRET` | CMS |
| `NEXT_PUBLIC_CMS_URL` | Both apps — CMS origin for API calls |
| `NEXT_PUBLIC_SITE_URL` | CMS — for sitemaps, CORS |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | CMS |
| `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` | CMS |
| `CRON_SECRET` | CMS — Bearer token for job queue |
| `R2_PUBLIC_URL` / `NEXT_PUBLIC_MEDIA_ORIGIN` | Media CDN |
| `R2_PREFIX` | Local dev media isolation |

## Non-negotiable constraints

- Public site must be statically exportable — no request-time rendering for public pages.
- Single Payload instance only (no staging env).
- Postgres only (`@payloadcms/db-postgres`); do not introduce Mongo.
- Run `pnpm codegen` after any schema/config change.
- If implementation conflicts with `docs/ARCHITECTURE.md`, update the docs before changing code.
