# SHNA Roadmap

This document outlines the **intended direction** of the SHNA web project.
It defines phases, scope boundaries, and decision checkpoints.
It is not a task list or delivery schedule.

## Immediate Priorities

These are the next steps to validate the overall direction before deeper
feature work:

- ✅ Static export pipeline works locally and serves media without CMS running
- ✅ Local export/serve workflow documented
- ✅ Cloudflare Pages: static export of the site app that serves a simple "Coming Soon" page with no backend dependency at runtime
- ✅ Fly: deploy the CMS app (Payload admin + API) against Supabase Postgres
- ✅ Production domains configured for CMS and public site
- ✅ R2 media storage for CMS uploads (avoid container-local media loss on deploy; restore media cache-busting)
- ⏳ Implement test mode flagging (`isTest`) + admin filters/bulk delete
- ⏳ After deployment baseline is green, return to remaining site errors and feature parity
- ✅ TODO: add Fly automation to scale CMS down to a single instance (cost-first, allow brief downtime)
- ✅ TODO: add a workflow step to reduce Fly CMS instances to 1 after deploy
- ⏳ TODO: add tests to verify CMS build and site static export
- ⏳ TODO: decide whether to remove seed functionality or make it SHNA-specific

## Guiding Principles

- Static-first public site
- Operational simplicity over automation
- Privacy-first data handling
- Single-backend architecture
- Docs are the source of truth

## Test Mode

Test mode is for internal ops testing, not marketing demos.

- **Definition:** Operational records created/handled in the same deployment and DB, flagged with `isTest: true`.
- **Activation:** Append `?mode=test` to a URL.
- **Persistence:** Once enabled, test mode remains active for the browsing session and is carried across internal links.
- **Stripe:** Use Stripe test keys (and test webhook secret when applicable) when test mode is active.
- **Admin UX:** Provide a **Show test data** filter and a **Delete all test records** action when viewing test data.

## Explicit Non-Goals

- Multiple backend instances (prod/staging)
- Dynamic public rendering
- Automated test data syncing or seeding
- CRM-style contact automation
- Real-time personalization

## Phase 0 — Foundation (Complete)

**Exit criteria**
- Architecture, development, decisions, and runbook docs exist
- Local dev is reproducible
- Guardrails are explicit

Status: ✅ Complete

## Phase 1 — Content & Public Site

**Focus**
- Pages, posts, media
- Static export pipeline
- Bilingual routing
- SEO + redirects

**Out of scope**
- Memberships
- Payments
- Email automation

**Exit criteria**
- Public site fully static
- CMS editors can publish bilingual content
- No server runtime required for public pages

## Phase 2 — Memberships & Donations

**Focus**
- Stripe checkout
- Webhook handling
- Membership records
- Manual reconciliation safety

**Out of scope**
- Subscriptions
- Proration
- Advanced billing logic

**Decision checkpoint**
- Webhook processing model
- Refund and correction handling

## Phase 3 — Communications

**Focus**
- Transactional email templates
- Broadcasts via collections
- Language-aware email delivery

**Out of scope**
- Marketing automation
- Drip campaigns

## Phase 4 — Admin Ergonomics

**Focus**
- Admin UI polish
- Audit visibility
- Content workflows

**Out of scope**
- Role explosion
- Complex permission matrices

## Test Mode & Privacy Constraints (Always-On)

- Test data is stored alongside live data and flagged with `isTest`
- No parallel demo environment (no subdomain, schema, or duplicate build)
- Data access and deletion requests handled manually
