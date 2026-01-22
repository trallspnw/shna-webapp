# TODO Log

This is a **running log** of smaller TODOs, notes, and cleanup items that don’t belong in the roadmap.

- Prefer short, atomic items.
- If something becomes a larger initiative, move it into `docs/ROADMAP.md`.
- If something is an actionable task for you/AI **right now**, put it in `docs/TASKS.md`.

---

## Current backlog (rolling)

- [ ] Remove all references to deprecated **“demo mode via schema + subdomain”** approach
- [ ] Update `docs/DECISIONS.md` to reflect **Test Mode** as the sole supported approach
- [ ] Audit `docs/RUNBOOK.md` for any references to:
  - demo schemas
  - demo Pages projects
  - content sync between environments
- [ ] Verify root `README.md` contains **no legacy demo-mode language**
- [ ] Decide final behavior for root (`/`) language handling:
  - load `en` directly without redirect **or**
  - redirect only when browser preference ≠ default
  [ ] Look into this:
  - 2026-01-22T04:15:07Z app[4d89455ea3e098] iad [info]Error: Internal: NoFallbackError
    2026-01-22T04:15:07Z app[4d89455ea3e098] iad [info]    at l (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1050)
    2026-01-22T04:15:07Z app[4d89455ea3e098] iad [info]    at responseGenerator (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1849)
    2026-01-22T04:15:21Z app[4d89455ea3e098] iad [info]Error: Internal: NoFallbackError
    2026-01-22T04:15:21Z app[4d89455ea3e098] iad [info]    at l (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1050)
    2026-01-22T04:15:21Z app[4d89455ea3e098] iad [info]    at responseGenerator (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1849)
    2026-01-22T04:15:24Z app[4d89455ea3e098] iad [info]Error: Internal: NoFallbackError
    2026-01-22T04:15:24Z app[4d89455ea3e098] iad [info]    at l (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1050)
    2026-01-22T04:15:24Z app[4d89455ea3e098] iad [info]    at responseGenerator (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1849)
    2026-01-22T04:34:33Z app[4d89455ea3e098] iad [info]Error: Internal: NoFallbackError
    2026-01-22T04:34:33Z app[4d89455ea3e098] iad [info]    at l (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1050)
    2026-01-22T04:34:33Z app[4d89455ea3e098] iad [info]    at responseGenerator (.next/server/app/(frontend)/[lang]/[slug]/page.js:2:1849)
    2026-01-22T04:34:33Z app[4d89455ea3e098] iad [info] ⨯ The requested resource isn't a valid image for /media/image-hero1-4.webp received null

---

## Completed

- [x] Deprecated demo-mode architecture in favor of **Test Mode**
- [x] Centralized Test Mode documentation under `docs/DEVELOPMENT.md`

---

## Notes / context (non-actionable)

- There is a brief redirect flash when loading `/` before `en` renders.
  - This is not broken, but may feel undesirable from a UX/perf standpoint.
  - Resolution depends on final language strategy decision (see backlog item above).
