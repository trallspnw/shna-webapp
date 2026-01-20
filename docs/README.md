# SHNA Documentation Index

Use this index to navigate the SHNA-specific documentation. The docs in this
folder are the canonical source of truth for architecture, workflows, and
operations.

## Canonical docs

- `docs/ARCHITECTURE.md` — system design, environments, test mode, localization, email strategy
- `docs/DEVELOPMENT.md` — local development setup and workflows
- `docs/RUNBOOK.md` — operational procedures and incident playbooks
- `docs/DECISIONS.md` — decision log explaining why key choices were made
- `docs/ROADMAP.md` — phased roadmap and scope boundaries
- `docs/LESSONS_LEARNED.md` — short notes captured during implementation
- `docs/DISABLED_FEATURES.md` — features intentionally disabled + how to re-enable

## Reading order

If you are new to the project:

1. `AGENTS.md` (repo guardrails and AI/contributor behavior)
2. `docs/ARCHITECTURE.md`
3. `docs/DEVELOPMENT.md`
4. `docs/RUNBOOK.md`
5. `docs/DECISIONS.md`
6. `docs/ROADMAP.md`
7. `docs/LESSONS_LEARNED.md`

## Test Mode

Test mode is for internal ops testing, not marketing demos.

- **Definition:** Operational records created/handled in the same deployment and DB, flagged with `isTest: true`.
- **Activation:** Append `?mode=test` to a URL.
- **Persistence:** Once enabled, test mode remains active for the browsing session and is carried across internal links.
- **Stripe:** Use Stripe test keys (and test webhook secret when applicable) when test mode is active.
- **Admin UX:** Provide a **Show test data** filter and a **Delete all test records** action when viewing test data.
