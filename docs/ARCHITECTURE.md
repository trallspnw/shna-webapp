# SHNA Architecture

## 1) Goals

* **Static-first public site** hosted on **Cloudflare Pages**, fully cacheable and indexable.
* **Single backend instance** using **Payload CMS** for admin, API, and webhooks.
* **Low-maintenance / low-ops** architecture suitable for a small nonprofit.
* **Bilingual support (English / Spanish)** via explicit route prefixes.
* Support memberships, donations, email, and content editing by non-technical staff.

---

## 2) Non‑Negotiable Constraints

* **No request‑time Node server required for public pages**

  * Public site must statically build and deploy.
* **One Payload instance only** (no staging environment).
* **Postgres only** (`@payloadcms/db-postgres`).
* **Demo mode**:

  * Separate **Postgres schema**
  * Routed via **demo subdomain**
  * **Manual, content‑only sync** from prod
  * Never sync ops data (contacts, memberships, payments, email logs)
* **Demo emails** must include `[DEMO]` in the subject.

These constraints are enforced intentionally. If something conflicts, stop and consult the docs.

---

## 3) System Overview

### Deploy Targets (Single Codebase)

**Static Site**

* Built/exported from `apps/site`
* Deployed to **Cloudflare Pages**
* Uses **Cloudflare R2** for media assets

**Backend**

* **Payload CMS only** (`apps/cms`), deployed to **Fly.io**
* Serves:

  * Admin UI
  * REST / GraphQL APIs
  * Webhooks (Stripe, email)

### Domains & Traffic

| Purpose     | Domain                                 | Platform            |
| ----------- | -------------------------------------- | ------------------- |
| Public site | `seminaryhillnaturalarea.org`          | Cloudflare Pages    |
| CMS / API   | `cms.seminaryhillnaturalarea.org`      | Fly.io (Payload)    |
| Demo site   | `demo.seminaryhillnaturalarea.org`     | Cloudflare Pages    |
| Demo CMS    | `cms-demo.seminaryhillnaturalarea.org` | Same Fly.io Payload |

> **Important:** There is only *one* Payload deployment. Demo vs prod behavior is determined at runtime.

---

## 4) Environment Model

We intentionally support **three modes**, not environments:

1. **prod**

   * Real content
   * Real memberships & payments
   * Real email delivery

2. **demo**

   * Separate Postgres schema
   * Safe for training/testing
   * Test Stripe keys
   * Email subject prefixed with `[DEMO]`

3. **local**

   * Developer machine
   * Usually local Postgres
   * May point to remote Supabase only in rare cases

> There is **no staging environment**. Demo replaces staging.

---

## 5) Database Strategy (Supabase + Schemas)

* **Supabase Postgres** is used in production.
* A **single database** contains multiple schemas:

| Schema               | Purpose         |
| -------------------- | --------------- |
| `prod` (or `public`) | Production data |
| `demo`               | Demo data       |

### DB Connection Choice

* **Fly CMS uses Supavisor Session pooler** (persistent Node server).
* **Transaction pooler** is only for serverless/edge use and requires disabling prepared statements if adopted later.
* Use the Supabase Dashboard → Connect → **Session** connection string for `DATABASE_URL`.

### Content vs Ops Data

**Content (syncable to demo)**

* Pages
* Posts / News
* Events
* Media metadata
* Globals (Header, Footer, email templates)

**Ops Data (never synced)**

* Contacts
* Members / Users
* Memberships
* Payments / Stripe artifacts
* Email delivery logs

### Demo Content Sync

* Triggered manually (admin action or CLI)
* Copies **content only** from prod schema → demo schema
* Overwrites demo content
* Never touches ops tables

---

## 6) Demo Routing & Schema Selection

Payload determines **mode** per request based on host:

* `cms.seminaryhillnaturalarea.org` → **prod schema**
* `cms-demo.seminaryhillnaturalarea.org` → **demo schema**

Implementation concept:

* Request middleware resolves `mode = 'prod' | 'demo'`
* Mode stored on `req.context`
* Database adapter selects the correct Postgres schema

> This preserves a **single Payload instance** while enabling isolated demo data.

---

## 7) Static Export Strategy

Public site rules:

* All public routes must be statically exportable
* No runtime `fetch` calls that require server execution
* No forced dynamic rendering without explicit approval

### Data Access

* Content is fetched at **build/export time** from the **Payload HTTP API**
* Read‑only APIs only (no server‑only secrets required)
* Build-time source: `NEXT_PUBLIC_CMS_URL`

### Media

* Media files stored in **Cloudflare R2**
* Public site references CDN URLs directly
* No `/api/media/*` calls required at runtime

### Preview

* Live preview exists **only inside Payload admin**
* Public site remains static

### Search

* The search page renders statically; results are fetched client-side from the CMS API.
* The site still renders without the backend, but search results require CMS availability.

---

## 8) Localization Strategy

* Canonical routing uses **prefixes**:

  * `/en/*`
  * `/es/*`

Rules:

* Locale is explicit in the URL
* No localStorage‑based language state as source of truth
* Content stored bilingually (localized fields or paired docs)
* Links must always include locale prefix

---

## 9) Email Strategy

### Structure

* **Globals**

  * Transactional templates (welcome, receipt, membership confirmation)
  * Fixed copy & branding

* **Collection**

  * Broadcasts / announcements
  * Individual send instances

### Demo Behavior

* Subject automatically prefixed with `[DEMO]`
* Uses test keys / sandbox rules
* Guardrails prevent sending to real lists by default

**Email Provider:** Brevo (kept for simplicity unless a clear benefit emerges)

---

## 10) Payments & Memberships

* **Stripe** used for memberships and donations
* Demo mode uses **Stripe test keys**
* Membership and payment data are ops data and **never synced**

---

## 11) Admin UX & Editor Safety

Payload admin is customized to favor:

* Clear labels and guidance
* Minimal configuration exposure
* Safe defaults
* Reduced cognitive load for non‑technical editors

Nice‑to‑have enhancements:

* Admin branding
* Improved spacing / typography
* Helper UI components

---

## 12) Decision Log

All architectural decisions and reversals are tracked in:

* `docs/DECISIONS.md`

If implementation conflicts with this document, update the docs **before** changing code.
### Monorepo Layout

* `apps/cms` — Payload CMS (admin + API + preview)
* `apps/site` — static export site (Cloudflare Pages)
* `packages/shared` — shared blocks, types, and frontend components
