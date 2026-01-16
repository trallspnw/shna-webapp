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

## Decision B — Demo mode uses duplicate content + manual content-only sync

**Status:** Accepted  
**Date:** 2026-01-16

### Context
We want a demo environment for training/testing that:
- allows editing demo content freely without touching production content
- avoids copying operational data (contacts, memberships, payments)
- can be refreshed on demand from production “content” when desired

### Decision
Demo mode will use:
- a **separate Postgres schema** (demo schema) + demo subdomain routing
- **duplicate content data** in demo (not shared live content)
- a **manual trigger** to sync *content-only* from prod → demo
- **no ops data** is ever synced (contacts, memberships, payments, etc.)

### Consequences
- Demo can safely be “messed with” for training/testing.
- Demo requires an explicit sync path for content collections/globals.
- We must clearly define which collections/globals count as “content” vs “ops”.

### Notes
Implementation should use a clear allowlist for “content” (and a denylist for “ops”) and should never rely on “sync everything except…” patterns.

---

## Decision C — Bilingual routing uses URL prefixes

**Status:** Accepted  
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
- Demo emails must include **`[DEMO]`** in the subject.

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

## Decision F — Single backend instance with demo resolution via routing + schema mapping

**Status:** Accepted  
**Date:** 2026-01-16

### Context
We want to minimize operational complexity and cost while still supporting:
- production usage
- demo/training usage
- static-first public delivery

Running multiple Payload instances (prod + staging + demo) increases:
- operational overhead
- risk of config drift
- mental load for a small, volunteer-run org

At the same time, demo mode must be **safe**, **isolated**, and **explicit**.

### Decision
SHNA will operate **one Payload backend instance** that supports both production and demo modes via:

- **Request-based resolution** (e.g. subdomain or hostname):
  - `www.seminaryhillnaturalarea.org` → production
  - `demo.seminaryhillnaturalarea.org` → demo

- **Database-level isolation**:
  - Production and demo use **separate Postgres schemas**
  - Schema selection is resolved per-request (not per-process)

- **Shared codebase and config**:
  - Same Payload config, collections, globals, plugins
  - No separate “demo server” or “staging server”

### Consequences
- Fewer moving parts to deploy, monitor, and secure.
- Demo behavior must be *explicitly handled* in code (routing, email flags, sync rules).
- All “environment-sensitive” logic must be request-aware (never global process state).
- Demo bugs can impact prod if guardrails are violated—so safeguards must be strong.

### Notes
- Demo resolution must be deterministic and early in the request lifecycle.
- Schema switching must never rely on mutable global state.
- Demo-specific behaviors (email subject tagging, sync restrictions, etc.) should derive from the resolved mode, not ad-hoc flags.
