# SHNA Roadmap

This document outlines the **intended direction** of the SHNA web project.
It defines phases, scope boundaries, and decision checkpoints.
It is not a task list or delivery schedule.

## Immediate Priorities

These are the next steps to validate the overall direction before deeper
feature work:

- Establish and validate the static build/export system end-to-end
- Configure the domain and publish a "coming soon" landing page
- Decide whether a preview of the WIP site should be exposed via demo mode
- Disable indexing (robots) until launch

## Guiding Principles

- Static-first public site
- Operational simplicity over automation
- Privacy-first data handling
- Single-backend architecture
- Docs are the source of truth

## Explicit Non-Goals

- Multiple backend instances (prod/staging)
- Dynamic public rendering
- Automated demo data syncing
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

## Demo & Privacy Constraints (Always-On)

- Demo data is content-only
- Ops data never syncs
- Data access and deletion requests handled manually
