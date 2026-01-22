# Agents / AI Collaboration Notes

This file used to contain a long, redundant set of “guardrails”. It has been condensed so it actually gets read.

## Where the real docs live

- Project overview: `README.md`
- Dev setup + test mode: `docs/DEVELOPMENT.md`
- Architecture: `docs/ARCHITECTURE.md`
- Operational procedures: `docs/RUNBOOK.md`
- Decisions / rationale: `docs/DECISIONS.md`

## Non‑negotiable constraints (quick)

- **Static-first public site**: no request-time Node server required for public pages.
- **Single Payload instance** (cost-first, small nonprofit).
- **Postgres** database.
- **Test mode** uses the same deployment/DB and marks operational records with `isTest: true`  
  → details: `docs/DEVELOPMENT.md#test-mode-ops-testing`

## When using AI in this repo

- Prefer **small, reviewable PR-sized changes**.
- Ask AI to provide:
  - a short plan,
  - a minimal diff,
  - and a “what could go wrong” checklist.
- Keep docs updated when behavior/constraints change.
