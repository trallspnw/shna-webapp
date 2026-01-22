# TODO Log

This is a **rolling log** of smaller TODOs, risks, and cleanup items that don’t belong in the roadmap.

Guidelines:
- Prefer short, atomic items.
- If something becomes a larger initiative, move it into `docs/ROADMAP.md`.
- If something is an actionable task **right now**, move it into a TASKS doc.
- This file should remain easy to skim in a few minutes.

---

## 🔴 High-priority (correctness / risk)

### Email system — post-implementation risks

- [ ] **Broadcast resend dedupe**
  - `sendBroadcastNow` does not currently skip recipients already sent if a broadcast is re-run.
  - Risk: accidental duplicate emails on partial failure or retry.
  - Fix: before creating a send, check `EmailSends` by `dedupeKey`
    (`broadcast:<broadcastId>:<recipient>`) and skip if status is `queued` or `sent`.

- [ ] **Endpoint-level safety net for transactional emails**
  - `sendTransactionalEmail()` is defensive, but DB failures inside email logging
    could still bubble.
  - Fix: wrap calls in Stripe webhook and membership status endpoint with a local
    `try/catch` that logs and continues.
  - Goal: email failures must *never* block business logic.

- [ ] **Template interpolation safety**
  - Template rendering currently inserts variables into HTML without escaping.
  - Acceptable for v1, but a footgun if user-supplied fields are inserted.
  - Decide one:
    - document “treat params as plain text only”, or
    - add minimal HTML escaping for interpolated values.

---

## 🟠 Medium-priority (prod stability / UX)

### Language & routing behavior

- [ ] Decide final behavior for root (`/`) language handling:
  - load `en` directly without redirect **or**
  - redirect only when browser preference ≠ default

- [ ] Investigate recurring **NoFallbackError** in site logs:

Error: Internal: NoFallbackError
at l (.next/server/app/(frontend)/[lang]/[slug]/page.js)
at responseGenerator (...)

- Likely related to dynamic route fallback or missing localized content.

- [ ] Investigate image error:

⨯ The requested resource isn't a valid image for /media/image-hero1-4.webp received null

### Subscription form UX

- [ ] Add localized validation copy for invalid email format in SubscriptionBlock (avoid generic "try again" for malformed emails).

---

## 🟡 Medium-priority (docs consistency / cleanup)

### Remove deprecated “demo mode” language

- [ ] Remove all references to deprecated **“demo mode via schema + subdomain”** approach
- [ ] Update `docs/DECISIONS.md` to reflect **Test Mode** as the sole supported approach
- [ ] Audit `docs/RUNBOOK.md` for any references to:
- demo schemas
- demo Pages projects
- content sync between environments
- [ ] Verify root `README.md` contains **no legacy demo-mode language**

---

## 🟢 Future hygiene / tooling (non-blocking)

### Build validation (local, Docker, prod-like)

- [ ] Add **build-validation tests** that mimic prod/GHA deployments  
(these are pipeline sanity checks, not unit/integration tests)

**Proposed approach**

- Add Docker Compose:
- `docker-compose.build.yml` (or extend an existing test compose file)

- Services:
- `db`
- `cms` (build + run + healthcheck)
- `site-build` (static export only; depends on cms)

- Add scripts:
- `scripts/validate-cms-build.sh`
  - build CMS image, boot it, wait for health, curl an endpoint
- `scripts/validate-site-build.sh`
  - boot db+cms, seed minimal content if needed, run site export,
    assert output exists
- `scripts/validate-builds.sh` (runs both)

- Add package script:
- `pnpm validate:builds`

**Acceptance**
- Runs on a clean machine with only Docker + pnpm installed
- Deterministic and fast-failing with clear logs
- Optional CI integration:
- manual `workflow_dispatch`, or
- run only on pushes to `main`

---

### Test & CI refinements

- [ ] Add minimal build checks to core CI:
- `pnpm -r lint`
- `pnpm -r typecheck`
- consider `pnpm -C apps/cms build`
- consider site build if stable

- [ ] Decide what “core tests” actually include
- Explicitly define the stable, deterministic slice that blocks CI.

- [ ] Stabilize and then promote selected “future” tests into core
- Promote only those that catch real regressions without flakiness.

- [ ] Add Playwright (or similar) functional tests later
- Start with a smoke suite (admin login, dashboard load, basic CRUD).
- Run nightly or on-demand first; promote to required only if stable.

- [ ] Verify test config paths referenced by scripts exist in-repo
- Some `apps/cms/package.json` scripts reference vitest configs under
  `apps/cms/tests/...`.
- Ensure these files exist and aren’t accidentally missing/generated.

---

## ✅ Completed

- [x] Deprecated demo-mode architecture in favor of **Test Mode**
- [x] Centralized Test Mode documentation under `docs/DEVELOPMENT.md`
- [x] Email System v1 implemented (transactional + broadcast); tests passing

---

## Notes / context (non-actionable)

- There is a brief redirect flash when loading `/` before `en` renders.
- Not broken, but noticeable.
- Resolution depends on final language strategy (see backlog above).
