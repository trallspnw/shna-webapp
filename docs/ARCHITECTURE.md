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
* **Test mode**:

  * Operational records live in the **same deployment + database**, flagged with `isTest: true`
  * Activated via `?mode=test` and persists for the browsing session across internal links
  * Stripe uses **test keys** when active; records from test flows store `isTest: true`
  * Admin UX includes a **Show test data** filter + **Delete all test records** action
* **Test emails** must include `[TEST]` in the subject.

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

> **Important:** There is only *one* Payload deployment.
> Cloudflare uses the "Redirect from WWW to root" rule template for the public site.

---

## 4) Environment Model

We intentionally support **two environments**:

1. **prod**

   * Real content
   * Real memberships & payments
   * Real email delivery

2. **local**

   * Developer machine
   * Usually local Postgres
   * May point to remote Supabase only in rare cases

**Test mode is not an environment.** It is a request-scoped flag that marks
operational records as `isTest: true` inside the same deployment and database.

> There is **no staging environment**.

---

## 5) Database Strategy (Supabase)

* **Supabase Postgres** is used in production.
* A **single schema** stores both production and test data.
* Operational collections include an `isTest: boolean` flag (and optional `expiresAt`) to mark test records.

### DB Connection Choice

* **Fly CMS uses Supavisor Session pooler** (persistent Node server).
* **Transaction pooler** is only for serverless/edge use and requires disabling prepared statements if adopted later.
* Use the Supabase Dashboard → Connect → **Session** connection string for `DATABASE_URL`.

### Content vs Ops Data

**Content**

* Pages
* Posts / News
* Events
* Media metadata
* Globals (Header, Footer, email templates)

**Ops Data (test-flagged when `mode=test`)**

* Contacts
* Members / Users
* Memberships
* Payments / Stripe artifacts
* Email delivery logs

---

## 6) Test Mode

Test mode is a **request-scoped** behavior for operational flows.

**Definition**

* Operational records created/handled in the same deployment
* Persisted in the same database with `isTest: true`
* No separate static build or subdomain
* Optional `expiresAt` may be used, but cleanup is primarily manual

**Activation**

* Canonical trigger: `?mode=test`
* Once enabled, test mode remains active for the browsing session and is carried across internal links

**Stripe behavior**

* Test mode uses Stripe **test keys** (and test webhook secret when applicable)
* Records from test flows must store `isTest: true`

**Admin visibility + cleanup**

* Admin lists should include a **Show test data** filter/toggle
* When viewing test data, provide a **Delete all test records** action (`isTest=true`)

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
* Revisions/drafts in Payload are used to demo content or UI changes
* Public site remains static

### Indexing Control

* Public site indexing is controlled by the `site-settings` global (`allowIndexing`) at build time.
* When indexing is disabled, the site outputs `noindex` meta tags, a `Disallow: /` robots.txt, and a static `_headers` rule that sets `X-Robots-Tag`.
* Changing this global requires a new static build; a CMS webhook can be added later to trigger the build if automation is desired.
* The CMS always emits `X-Robots-Tag: noindex` headers and a `Disallow: /` robots.txt.
* `robots.txt` is generated at build time for the site and served by a dedicated route in the CMS.

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

### Test Mode Behavior

* Subject automatically prefixed with `[TEST]`
* Uses test keys / sandbox rules
* Guardrails prevent sending to real lists by default

**Email Provider:** Brevo (kept for simplicity unless a clear benefit emerges)

---

## 10) Payments & Memberships

* **Stripe** used for memberships and donations
* Test mode uses **Stripe test keys**
* Membership and payment records created in test mode must store `isTest: true`

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

## 12) Glossary

**Test Mode**

Operational testing state activated by `?mode=test` that keeps all data in the
same deployment and database, flagged with `isTest: true`. Intended for internal
ops testing, not marketing demos.

---

## 13) Decision Log

All architectural decisions and reversals are tracked in:

* `docs/DECISIONS.md`

If implementation conflicts with this document, update the docs **before** changing code.
### Monorepo Layout

* `apps/cms` — Payload CMS (admin + API + preview)
* `apps/site` — static export site (Cloudflare Pages)
* `packages/shared` — shared blocks, types, and frontend components
