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

---

## Completed

- [x] Deprecated demo-mode architecture in favor of **Test Mode**
- [x] Centralized Test Mode documentation under `docs/DEVELOPMENT.md`

---

## Notes / context (non-actionable)

- There is a brief redirect flash when loading `/` before `en` renders.
  - This is not broken, but may feel undesirable from a UX/perf standpoint.
  - Resolution depends on final language strategy decision (see backlog item above).
