# Roadmap

Big, trackable work blocks. This is **not** a scratchpad.

- For small cleanup items: `docs/TODO_LOG.md`
- For near-term actionable tasks (including AI-delegation): `docs/TASKS.md`

## 1) Platform & Deployment

- [x] Static export pipeline works locally and serves media without CMS running
- [x] Local export/serve workflow documented
- [x] Cloudflare Pages: static export of the site app (works with a simple “Coming Soon” page with no backend dependency at runtime)
- [x] Fly: deploy the CMS app (Payload admin + API) against Supabase Postgres
- [x] Production domains configured for CMS and public site
- [x] R2 media storage for CMS uploads (avoid container-local media loss on deploy; restore media cache-busting)
- [x] Automate “scale CMS to 1 instance” after deploy (cost-first; allow brief downtime)

## 2) Content & Localization

- [x] Implement bilingual routing + localized fields (CMS + public site)
- [ ] Content workflow polish (editor UX, guardrails, previews, defaults)
- [ ] Define translation approach for core pages and reusable blocks
- [ ] Fill initial site content (English + Spanish)

## 3) Identity, Membership, and Payments

- [ ] Finalize identity model and membership lifecycle (see `docs/design/identity-membership.md`)
- [ ] Implement membership checkout + receipt emails
- [ ] Implement donation checkout + receipt emails
- [ ] Admin workflows for managing members / contacts / subscriptions
- [ ] Reporting basics (exports, member list, donation totals)

## 4) Operations & Reliability

- [ ] Backups (DB + R2) and restore drill
- [ ] Monitoring / alerting essentials (errors, webhooks, job failures)
- [ ] Runbook completeness for the “things that break”
- [ ] Security review pass (secrets, access control, least privilege)

## 5) Growth & Communications

- [ ] Email broadcast workflow (subscribers, segments, templates)
- [ ] Events + updates content cadence
- [ ] Donation/membership conversion improvements (copy, UX, friction reduction)
