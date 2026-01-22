# SHNA Decision Log

This file records “why we chose what we chose” so future changes stay aligned with SHNA constraints.

Format:
- **ID**: A, B, C… (or date-based if preferred later)
- **Status**: Accepted | Superseded | Deprecated
- **Context**: What problem we were solving
- **Decision**: What we chose
- **Consequences**: What this implies / tradeoffs
- **Notes**: Optional implementation notes

---

## Test Mode

Test mode details live in `docs/DEVELOPMENT.md#test-mode-ops-testing`.
## Decision B — Superseded demo approach (duplicate content + manual sync)

**Status:** Superseded (by Decision H)  
**Date:** 2026-01-16

### Context
We previously explored a demo environment for training/testing.

### Decision
Superseded by **Decision H** (Test Mode). Demo mode is no longer part of the architecture.

### Consequences
Demo-specific schemas, routing, and content sync are not implemented or maintained.

---

## Decision C — Bilingual routing uses URL prefixes

**Status:** Superseded (by Decision H)  
**Date:** 2026-01-16

### Context
We need bilingual support that is static-export friendly and deterministic (no hidden language state that can drift).

### Decision
Public routes are prefix-based:
- `/en/*`
- `/es/*`

### Consequences
- Language is always explicit in URLs (good for SEO + caching).
- Content/query logic must resolve language from the prefix.
- No “language mode” stored in localStorage should be required for core routing.

---

## Decision D — Email templates are Globals; broadcasts are a Collection

**Status:** Accepted  
**Date:** 2026-01-16

### Context
We need transactional emails (stable templates) and broadcast emails (many instances, history, scheduling, etc.).

### Decision
- Transactional templates/constants: **Globals**
- Broadcast email instances: **Collection**
- Test emails must include **`[TEST]`** in the subject.

### Consequences
- Globals act as canonical templates/config.
- Broadcast collection provides audit trail and repeatability.
- Demo-mode sending must be strongly signaled and safe by default.

---

## Decision E — Local development uses Postgres in Docker + app on host

**Status:** Accepted  
**Date:** 2026-01-16

### Context
We want easy local setup with minimal moving parts and no need to install/manage Postgres directly on the host.

### Decision
- Run Postgres as a Docker dependency (`compose.dev.yml`)
- Run Payload/Next dev server on the host (`pnpm dev`)
- Provide a one-liner `pnpm dev:full` to start deps and dev server

### Consequences
- Clear boundary: Docker for infra, host for app.
- If Postgres image major version changes, volumes may need reset (`deps:reset`).
- Easy future extension: add Stripe CLI/webhook forwarding to “deps” later if desired.

---

## Decision F — Superseded demo routing + schema mapping plan

**Status:** Superseded (by Decision H)  
**Date:** 2026-01-16

### Context
We previously explored a demo/training mode while keeping a single backend instance.

### Decision
Superseded by **Decision H** (Test Mode). No demo routing or schema switching is used.

### Consequences
Demo-specific routing and schema selection are intentionally avoided.

---

## Decision G — Workspace split: cms + site + shared with build-time HTTP export

**Status:** Accepted  
**Date:** 2026-01-16

### Context
We need a static export that can run independently on Cloudflare Pages while keeping the Payload Website Template feature set in the CMS app. The existing single-app layout made it too easy to accidentally couple public rendering to a Node server.

### Decision
Adopt a pnpm workspace with:
- `apps/cms` for Payload CMS (admin + API + preview)
- `apps/site` for static export (Cloudflare Pages)
- `packages/shared` for shared blocks, types, and frontend components

Static export reads content at build time from the Payload HTTP API (read-only), using `NEXT_PUBLIC_CMS_URL`.

### Consequences
- Public pages are fully static and can render without a backend runtime.
- The CMS app retains preview/live preview capabilities.
- Shared blocks/types reduce drift between the CMS schema and site rendering.

---

## Decision H — Test Mode uses request-scoped flagging (no parallel demo environment)

**Status:** Accepted  
**Date:** 2026-02-01

### Context
We need a safe way to test operational flows (payments, memberships, emails)
without standing up a parallel environment or switching database schemas.

### Decision
Test mode will be:
- Activated by the canonical query param `?mode=test`
- Persisted for the browsing session across internal links
- Stored in the same database using `isTest: true` on operational collections
- Routed to Stripe **test keys** (and test webhook secrets when applicable)
- Surfaced in admin with a **Show test data** filter and **Delete all test records** action

### Consequences
- No separate demo subdomain, schema, or static build is required.
- All operational code paths must honor `isTest` and avoid mixing test with live data.
- Cleanup is manual and intentional; the database stays small by purging test records.

---

## Decision I — Remove Form Builder + Submissions (use custom transactional flows)

**Status:** Accepted  
**Date:** 2026-03-08

### Context
The built-in Form Builder plugin creates generic `forms` and `form-submissions` collections, but SHNA’s core flows
(donations, memberships, status checks, email signup) are transactional and require Stripe + custom logic.

### Decision
Disable the Form Builder plugin and remove the Form Block from pages. Keep the existing custom transactional flows
as the primary implementation path. Leave database tables in place for potential future reuse.

### Consequences
- No generic “Form submissions” collection is surfaced in admin.
- Contact forms, if needed later, should be implemented as purpose-built collections or custom flows.
- Re-enabling the Form Builder requires restoring plugin config + page blocks + types.

---

## Decision J — Localization via URL prefixes + localized fields

**Status:** Accepted  
**Date:** 2026-03-08

### Context
We need bilingual support that preserves content parity, remains static-export friendly, and avoids duplicate page documents.

### Decision
Use URL prefixes (`/en/*`, `/es/*`) as the canonical source of truth and enable Payload localization on public content fields.
Slugs are canonical (not localized). LocalStorage is used only to remember a user’s explicit language choice and to inform
root/share redirects, never as the routing source of truth.

### Consequences
- Each page is a single document with localized fields and fallback to `en` when missing.
- Public site routes always include `/en` or `/es`, and internal links must include the prefix.
- Root and share routes use a shared locale detection utility: localStorage → browser language → `en`.