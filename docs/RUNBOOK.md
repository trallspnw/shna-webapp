# SHNA Runbook

This document defines **operational procedures** for the Seminary Hill Natural Area (SHNA) web application.

This runbook is intentionally **practical and prescriptive**. It exists to reduce risk during incidents, maintenance, or sensitive operations.

This is **not**:

* an architecture reference (see `docs/ARCHITECTURE.md`)
* a development guide (see `docs/DEVELOPMENT.md`)
* a decision log (see `docs/DECISIONS.md`)

If something feels urgent, confusing, or risky — start here.

---

## System Overview

**High-level architecture:**

* **Public site**: Static export hosted on Cloudflare Pages
* **Media**: Cloudflare R2
* **Backend**: Single Payload CMS instance (Fly.io)
* **Database**: Postgres (Supabase)
* **Payments**: Stripe
* **Email**: Brevo
* **Demo mode**: Same backend, separate Postgres schema, demo subdomain routing

**Key principle**: There is **one backend instance**. Safety is achieved through routing, schema separation, and process — not duplicated infrastructure.

---

## Access & Authority

### Authorized Roles

Only the following roles may perform sensitive actions:

* **Payload Admin**

  * Board-approved administrators only
* **Database (Supabase)**

  * Treasurer
  * Lead technical maintainer
* **Stripe**

  * Treasurer only
* **DNS / Domain / Cloudflare**

  * Board-approved administrator

If you do not have access, **do not attempt workarounds**. Escalate instead.

---

## Core Safety Rules (Non-Negotiable)

* Never modify production data casually or experimentally
* Never sync **demo → prod** data
* Never test payments outside demo mode
* Never expose contact or membership data for testing
* Prefer stopping functionality over risking corruption or disclosure

When in doubt: **pause, document, and escalate**.

---

## Demo Mode Operations

### What Demo Mode Is

* Uses the **same backend instance**
* Uses a **separate Postgres schema**
* Accessed via a **demo subdomain**
* Intended for:

  * demos
  * training
  * safe testing of flows

### Demo Constraints

* Demo emails **must include `[DEMO]` in the subject**
* Demo payments use Stripe test keys only
* Demo content may be freely modified

### Data Sync Rules

* Demo content is refreshed via **manual, content-only sync**
* **Never sync operational data**, including:

  * contacts
  * memberships
  * donations
  * payments

---

## Common Operations

### Deployments (GitHub Actions)

Deployments run from GitHub Actions on `main` and can be triggered manually.

#### CMS (Fly.io)

* Workflow: `.github/workflows/deploy-cms.yml`
* Config: `apps/cms/fly.toml` (single instance in `iad`, 512 MB RAM)
* Required GitHub secret: `FLY_API_TOKEN`
* Required Fly secrets: `DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`, `PREVIEW_SECRET`
* Public URLs live in `apps/cms/fly.toml` under `[env]` and `[build.args]` (update if domains change)
* **DB connection choice:** use Supabase **Session pooler** for Fly (persistent Node server). Transaction pooler is only for serverless/edge, and would require disabling prepared statements if used later.
* Supabase path: Dashboard → **Connect** → copy the **Session** pooler connection string.
* `DATABASE_URL` format (Session pooler):

  ```env
  DATABASE_URL=postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
  ```

#### Site (Cloudflare Pages)

* Workflow: `.github/workflows/deploy-site.yml`
* Required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
* Required GitHub variables: `SITE_PROJECT_NAME`, `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEMO_SITE_URL`
* Build uses `NEXT_PUBLIC_CMS_URL` to fetch content during static export
* For a demo Pages project, add a second job that swaps the demo URLs and project name

### Restart Backend

* Restart via Fly.io dashboard
* Expected impact: brief admin/API downtime
* No data loss expected

### Rebuild Public Site

* Trigger static rebuild via Cloudflare Pages
* Ensure correct environment (prod vs demo)

### Verify Demo Safety

Before any demo:

* Confirm demo subdomain
* Confirm `[DEMO]` email subject prefix
* Confirm Stripe test mode

---

## Incident Playbooks

These playbooks are intentionally concise. Expand only after real incidents.

### Public Site Is Down

1. Check Cloudflare Pages build status
2. Verify latest deployment succeeded
3. If uncertain, roll back to last known-good build

---

### Admin Panel Unavailable

1. Check Fly.io instance status
2. Restart backend if necessary
3. Confirm database connectivity

---

### Payments Failing

1. Disable donation or membership entry points if possible
2. Check Stripe dashboard for errors
3. Verify webhook delivery
4. Do not retry payments manually without confirmation

---

### Emails Not Sending

1. Verify Brevo service status
2. Check recent send logs
3. Confirm API keys and rate limits
4. Avoid repeated retries

---

### Data Integrity Concern

1. Stop further writes if possible
2. Document what is known
3. Escalate immediately
4. Do not attempt silent fixes

---

## Privacy & Data Protection (Explicit)

SHNA handles personal data responsibly and conservatively.

### Data Types

Operational data may include:

* names
* email addresses
* membership status
* donation history

### Data Minimization

* Only collect data necessary for operations
* Avoid storing unnecessary free-form personal notes

### Right to Disclosure

Contacts may request:

* a summary of their stored data

Process:

1. Verify requester identity
2. Manually extract relevant records
3. Provide disclosure in a reasonable timeframe

### Right to Deletion

Contacts may request deletion of their data.

Process:

1. Verify requester identity
2. Identify all related records
3. Manually delete or anonymize as appropriate
4. Confirm completion

**Note**: Some records (e.g. financial transactions) may need to be retained for legal or accounting purposes. In these cases, personal identifiers should be minimized where possible.

### No Automation Assumption

Privacy requests may be handled **manually**. This is acceptable for SHNA’s scale and reduces risk.

---

## Escalation Philosophy

* Prefer safety over availability
* Prefer clarity over speed
* Prefer documented decisions over silent action

If unsure: stop, record context, and escalate.

---

## Change Log

* Initial version created during system stabilization phase
