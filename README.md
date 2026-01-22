# Friends of Seminary Hill Natural Area (SHNA) Website

This repository powers the **Friends of Seminary Hill Natural Area** public website and membership/donation system.

It is based on the **Payload Website Template**, with additional constraints and conventions to keep it:
- low-maintenance
- safe for non-technical editors
- **static-first** for the public site
- bilingual (English / Spanish)
- suitable for a small nonprofit with limited budget and staffing

## Start here

- **Docs index**: `docs/README.md`
- **Run locally**: `docs/DEVELOPMENT.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Runbook**: `docs/RUNBOOK.md`
- **Roadmap / tasks**: `docs/ROADMAP.md`, `docs/TASKS.md`, `docs/TODO_LOG.md`

## Repo layout

```
apps/
  cms/   # Payload CMS app (admin + API + preview)
  site/  # Public static site (Cloudflare Pages)
packages/
  shared/ # Shared blocks, types, and UI
docs/     # Project documentation
```

## Core constraints (quick)

- Public site must be **static-exportable** (no request-time Node server required for public pages).
- Single production deployment (cost-first).
- Postgres database.
- “Test mode” is supported for ops testing (details in `docs/DEVELOPMENT.md#test-mode-ops-testing`).

## About the template

The upstream template includes extensive documentation and feature references.
This repo intentionally keeps our docs focused on **what we actually use** and **the constraints we enforce**.

If you need template-level background, start with the official Payload Website Template docs/source.
