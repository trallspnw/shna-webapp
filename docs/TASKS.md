# TASKS

A sequenced, AI-ready implementation plan for **Identity / Membership / Payments / Email**.

Design references:
- **ERD**: `docs/design/erd.mmd`
- **Identity & Membership**: `docs/design/identity-membership.md`
- Also see: `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/DEVELOPMENT.md`

Conventions:
- Each task is written to be completed independently and merged safely.
- “Done when” = objective success criteria.
- Prefer minimal UI (unstyled) suitable for functional testing.

---

## Phase 0 — Repo + docs alignment

- [ ] **T000 — Confirm docs structure + update cross-links**
  - **Goal:** Ensure docs refer to the new structure (e.g., `docs/design/*`) and future AI can find the sources of truth quickly.
  - **Work:**
    - Verify `docs/README.md` links to:
      - `docs/design/erd.mmd`
      - `docs/design/identity-membership.md`
    - Add a short “Where to look first” section pointing to the two design docs above.
  - **Done when:** `docs/README.md` contains working links and a short pointer section.

- [ ] **T001 — Add env var documentation stubs for Stripe + Brevo**
  - **Goal:** Make local/dev setup obvious before wiring integrations.
  - **Work:**
    - In `docs/DEVELOPMENT.md` (or `docs/RUNBOOK.md`), add sections:
      - “Stripe (Payload Stripe plugin)”
      - “Brevo (Transactional email + list sync)”
    - List required env vars (names only, no secrets) and where they are used (cms vs site).
  - **Done when:** docs list the env keys and which app reads them.

---

## Phase 1 — Core data model in Payload (collections + access)

> Implement the collections described in `docs/design/erd.mmd` and referenced flows in `docs/design/identity-membership.md`.

- [ ] **T010 — Implement `contacts` collection (email required)**
  - **Goal:** Create the canonical identified person record.
  - **Work:**
    - Add Payload collection `contacts` with fields:
      - `email` (required, unique; normalized lower/trim in hook)
      - `displayName` (optional, free-form)
      - `phone` (optional, free-form)
      - `address` (optional, free-form)
      - `language` (select: `en|es|unknown`, default `unknown`)
      - `isTest` (boolean, default false)
    - Add indexes where supported (email).
    - Add admin labels and a brief help text describing privacy stance.
  - **Done when:** Admin can create/search contacts; duplicate emails rejected; emails normalize to lowercase.

- [ ] **T011 — Implement `campaigns` collection (optional attribution)**
  - **Goal:** Support `ref`/campaign attribution without hard-coding strings everywhere.
  - **Work:** Add `campaigns` per ERD (`key`, `slug`, `name`, `channel`, active flags, dates, `isTest`).
  - **Done when:** Admin can create campaigns; other collections can reference campaigns (next tasks).

- [ ] **T012 — Implement `subscriptionTopics` + `subscriptions` collections**
  - **Goal:** Newsletter/broadcast list now, topics later.
  - **Work:**
    - `subscriptionTopics` collection: `key`, `slug`, `name`, `description`, `isActive`, `isTest`.
    - `subscriptions` collection:
      - `contact` (relationship to contacts)
      - `topic` (relationship to topics)
      - status fields (`subscribed|unsubscribed|bounced`), timestamps
      - attribution fields (`campaign`, `refRaw`, utm group — optional)
      - `isTest`
    - Enforce uniqueness on (contact, topic) (via hook if DB constraint not available).
  - **Done when:** Admin can subscribe a contact to a topic; duplicates prevented; can mark unsubscribed.

- [ ] **T013 — Implement `membershipPlans` collection (USD fields in CMS)**
  - **Goal:** Define what you sell.
  - **Work:** Add `membershipPlans` per ERD:
    - `key` (immutable, unique) + `slug` + `name`
    - `priceUSD` (number; CMS-facing dollars)
    - `durationMonths` (default 12)
    - `renewalWindowDays` (default 30)
    - `isActive`, `isTest`
  - **Done when:** Admin can create a plan; price displays in dollars.

- [ ] **T014 — Implement `membershipAccounts` collection**
  - **Goal:** Define who membership applies to (without “household of one” confusion).
  - **Work:**
    - Add `membershipAccounts` fields:
      - `type` (`individual|household`)
      - `primaryContact` (required relationship to contacts)
      - `secondaryContacts` (optional relationship many to contacts)
      - `anonymousMemberCount` (optional number, default 0)
      - attribution: `campaign`, `refRaw`, utms (optional)
      - `isTest`
    - Add admin help text: secondary contacts are for adults; avoid child PII.
  - **Done when:** Admin can create membership account; pick primary contact; optionally add secondaries and anonymousMemberCount.

- [ ] **T015 — Implement `membershipTerms` collection**
  - **Goal:** Track coverage windows + renewals + plan switching.
  - **Work:**
    - Add fields:
      - `membershipAccount` (required relationship)
      - `plan` (required relationship)
      - `planKeySnapshot` (string; copy from plan.key)
      - `pricePaidUSD` (number snapshot)
      - `status` (`active|expired|canceled|refunded|comped`)
      - `startsAt`, `expiresAt`
      - `renewedFromTerm` (optional relationship to membershipTerms)
      - `transaction` (optional relationship to transactions)
      - attribution fields + `isTest`
    - Add hook/validation:
      - `expiresAt` must be after `startsAt`
      - `planKeySnapshot` auto-populates from plan
  - **Done when:** Admin can create terms; validation works; planKeySnapshot autopopulates.

- [ ] **T016 — Implement `products`, `orders`, `orderItems` collections (retail)**
  - **Goal:** Retail catalog in CMS + order records for event purchases.
  - **Work:**
    - `products`: `key`, `slug`, `name`, `description`, `nonMemberPriceUSD`, `memberPriceUSD`, `isActive`, `isTest`.
    - `orders`: `orderNumber`, `status`, `pricingBasis`, `stayAnon`, optional `contact`, optional `event`, attribution, `isTest`.
    - `orderItems`: `order`, `product`, `variant` (optional), `quantity`, `unitPriceUSD`, `totalUSD`, `isTest`.
    - Add hooks:
      - orderNumber generated (simple prefix + timestamp ok)
      - orderItems totalUSD computed
  - **Done when:** Admin can create products; create an order with items; totals calculate.

- [ ] **T017 — Implement `events` + `eventAttendances` collections**
  - **Goal:** Public events + operational check-in + anonymous tallies.
  - **Work:**
    - `events`: `slug`, `title`, `status`, `startsAt`, `endsAt`, `timezone`, `location`, content fields, `checkInEnabled`, `checkInCode`, `isTest`.
    - `eventAttendances`: `event` required; `contact` optional; `alias` optional (future); `anonymousCount` optional; `method`; `checkedInAt`; attribution; `isTest`.
    - Enforce “identity mode” constraint (exactly one of):
      - contact set, OR alias set, OR anonymousCount >= 1
  - **Done when:** Admin can create event and attendance; cannot save invalid identity combinations; can add a single anonymousCount row.

- [ ] **T018 — Implement `aliases` collection (design-in, not launched)**
  - **Goal:** Keep schema ready for pseudonymous identity without using it yet.
  - **Work:** Add `aliases` collection per ERD; do NOT surface in public UI; keep admin access restricted.
  - **Done when:** Collection exists; `eventAttendances.alias` relationship works; nothing on public site depends on aliases.

- [ ] **T019 — Implement `transactions` collection (ledger / reconciliation log)**
  - **Goal:** Single internal ledger supporting membership, donation, retail, cash logs.
  - **Work:**
    - Fields per ERD:
      - kind, paymentMethod, status, amountUSD, currency
      - optional `contact`
      - `stayAnon` boolean
      - `pricingBasis` (`member|non_member|unknown`)
      - optional links: `membershipTerm`, `order`, `event`
      - attribution fields + Stripe IDs + occurredAt + `isTest`
    - Add hooks:
      - occurredAt defaults to now on create
      - For stayAnon=true: enforce `contact` must be null (prevent accidental linkage)
  - **Done when:** Admin can log cash transactions; Stripe fields optional; stayAnon prevents linking.

---

## Phase 2 — Shared services in CMS (membership lookup, pricing, attribution)

- [ ] **T020 — Add email normalization + lookup utilities**
  - **Goal:** One canonical way to normalize and query by email.
  - **Work:**
    - Create shared utility in cms app (e.g., `apps/cms/src/lib/email.ts`) to normalize email.
    - Add helper functions:
      - `getActiveMembershipByEmail(email): { isActive, membershipAccountId, planKey, expiresAt }`
      - `isRenewable(term, now)` using plan renewalWindowDays
  - **Done when:** Utilities compile; unit tests (or basic runtime script) confirm normalization and a sample lookup.

- [ ] **T021 — Add attribution parsing helper (ref + utm)**
  - **Goal:** Consistent attribution capture across flows.
  - **Work:**
    - Utility to parse `{ ref, utm_* }` inputs.
    - Optional lookup of `campaign` by slug/key when present.
  - **Done when:** Can attach attribution to a created record from query params in later flows.

---

## Phase 3 — Stripe integration (Payload Stripe plugin)

Assumption: use the official Payload Stripe plugin in `apps/cms` and Stripe webhooks for fulfillment.

- [ ] **T030 — Install + configure Payload Stripe plugin (cms)**
  - **Goal:** Stripe is available in Payload CMS with local/dev keys.
  - **Work:**
    - Add the Stripe plugin to `apps/cms/src/plugins/index.ts` and configure env vars.
    - Document env vars in `docs/DEVELOPMENT.md`.
    - Ensure webhook endpoint is available in dev (document how to use Stripe CLI).
  - **Done when:** CMS boots with plugin enabled; Stripe CLI can hit webhook endpoint successfully.

- [ ] **T031 — Implement “Checkout Intent” pattern (no PII persistence for receipt-only)**
  - **Goal:** Webhook fulfillment can read `stayAnon`, `kind`, attribution, etc. without storing payer email.
  - **Work:**
    - Create minimal `checkoutIntents` collection or server-side store keyed by `stripeCheckoutSessionId`:
      - kind (`donation|retail|membership`)
      - stayAnon flag
      - pricingBasis snapshot
      - eventId, campaign/ref/utm
      - for retail: orderId
      - for membership: membershipPlanId + membershipAccountId
      - `isTest`, timestamps
    - Ensure no payer email is stored in checkout intent.
  - **Done when:** You can create a checkout intent and later resolve it from a webhook by session ID.

- [ ] **T032 — Membership checkout flow (requires contact + creates membershipTerm on webhook)**
  - **Refs:** `docs/design/identity-membership.md` section A + B
  - **Goal:** End-to-end membership purchase with term creation.
  - **Work:**
    - API route (cms or site → cms) to:
      - upsert contact
      - create/update membershipAccount
      - create Stripe checkout session
      - create checkoutIntent
    - Webhook handler:
      - on paid: create `transactions` (kind=membership), then create `membershipTerms`:
        - startsAt = existing active term.expiresAt if renewing else now
        - expiresAt computed from plan duration
        - planKeySnapshot + pricePaidUSD snapshot
        - link transaction
  - **Done when:** A membership purchase in Stripe results in a membershipTerm and transaction in CMS; plan switching works by selecting a different plan.

- [ ] **T033 — Donation checkout flow (receipt-only + Stay anonymous)**
  - **Refs:** `docs/design/identity-membership.md` section C
  - **Goal:** Donation works without creating/updating a contact when stayAnon=true.
  - **Work:**
    - API route to create Stripe session with metadata including stayAnon + attribution.
    - On webhook:
      - create `transactions` (kind=donation)
      - if stayAnon=true: do not link contact and do not store email
  - **Done when:** Paid donation creates a transaction with Stripe IDs; no contact created/updated when stayAnon=true.

- [ ] **T034 — Retail checkout flow (order + items + member pricing + receipt-only)**
  - **Refs:** `docs/design/identity-membership.md` section D
  - **Goal:** Retail order checkout with member pricing lookup but no PII storage for stayAnon.
  - **Work:**
    - API route to:
      - create `orders` + `orderItems` (pending)
      - compute pricingBasis:
        - if email belongs to active membership → member pricing
        - else non-member pricing
      - create Stripe checkout session
      - create checkoutIntent with orderId + pricingBasis + stayAnon + event attribution
    - Webhook:
      - create `transactions` (kind=retail, link order)
      - update `orders.status = paid`
      - if stayAnon=true: ensure order.contact remains null and no email stored
  - **Done when:** Paid retail checkout results in order paid + transaction created; pricingBasis stored; no contact linkage for stayAnon.

- [ ] **T035 — Basic admin “Payments sanity” view**
  - **Goal:** Minimal admin UX for testing/reconciliation.
  - **Work:**
    - Update admin dashboard (or add a simple custom view) listing:
      - latest transactions (kind/status/amount/event/stayAnon)
      - latest orders (status/pricingBasis/event)
      - latest membershipTerms (plan/expiresAt)
  - **Done when:** Admin home shows basic lists; no styling required beyond defaults.

---

## Phase 4 — Brevo integration (transactional email + list sync)

Recommended tooling:
- Use Brevo Transactional Email via API using the official Node SDK (or direct REST calls).
- Keep “broadcast list” logic in your DB (`subscriptions`), and sync to Brevo lists in a job/hook.

- [ ] **T040 — Add Brevo client wrapper (cms)**
  - **Goal:** One safe integration point for transactional email + contact/list operations.
  - **Work:**
    - Create `apps/cms/src/integrations/brevo/*`:
      - client initialization from env
      - helpers:
        - `sendTransactionalEmail(templateId, toEmail, params)`
        - `upsertBrevoContact(email, attributes)`
        - `addContactToList(email, listId)`
        - `removeContactFromList(email, listId)`
    - Add env var docs.
  - **Done when:** Brevo wrapper compiles; a simple dev script can send a test email.

- [ ] **T041 — Receipt email strategy**
  - **Goal:** Decide and implement receipt sending for each payment type.
  - **Work:**
    - For **receipt-only** donations/retail: rely on **Stripe receipt email** (default).
    - For **membership**: send a Brevo email confirmation (since membership implies contact storage).
    - Document this in `docs/design/identity-membership.md` (add a short “Email/Receipts” section).
  - **Done when:** Docs updated and membership confirmation can be sent via Brevo.

- [ ] **T042 — Membership confirmation email (Brevo)**
  - **Goal:** After membership purchase webhook, send an email via Brevo.
  - **Work:**
    - On membership webhook success:
      - call Brevo transactional email with:
        - membership plan name
        - startsAt/expiresAt
        - renewal window guidance
    - Keep content minimal; no styling requirement.
  - **Done when:** Paid membership triggers a Brevo email to the contact email.

- [ ] **T043 — Subscription topic sync to Brevo lists**
  - **Goal:** Keep Brevo lists aligned with your `subscriptions` table.
  - **Work:**
    - Add mapping strategy:
      - Each `subscriptionTopic` has `brevoListId` (optional field)
      - If set, changing `subscriptions.status` triggers list add/remove
    - Implement hook:
      - on subscribe → add to list
      - on unsubscribe → remove from list
  - **Done when:** Toggling subscription status updates Brevo list membership (in dev/test).

- [ ] **T044 — Bounce handling (optional but recommended)**
  - **Goal:** Mark subscription status `bounced` when Brevo reports failures.
  - **Work:**
    - Add a webhook endpoint to receive Brevo events (bounce/unsub).
    - Verify signature if supported.
    - Update `subscriptions.status` accordingly.
  - **Done when:** A simulated webhook can mark a subscription as bounced/unsubscribed.

---

## Phase 5 — Minimal public site routes (unstyled functional UI)

> Success criteria: basic forms + success pages only (no styling).

- [ ] **T050 — Public: membership purchase page**
  - **Goal:** Minimal UI to purchase a membership.
  - **Work:**
    - Create route in `apps/site` (e.g., `/membership/join`) with:
      - email (required)
      - displayName (optional)
      - plan selection
      - optional secondary contact emails (optional)
      - anonymousMemberCount (optional for household)
    - On submit: call backend endpoint that creates Stripe checkout and redirects to Stripe.
  - **Done when:** User can reach Stripe checkout from the site and complete purchase.

- [ ] **T051 — Public: donation page (Stay anonymous toggle)**
  - **Goal:** Receipt-only donation checkout with privacy option.
  - **Work:** Route `/donate` with amount + email + “Stay anonymous” checkbox (tooltip fine print).
  - **Done when:** Donation completes in Stripe and transaction is logged without contact linkage when stayAnon=true.

- [ ] **T052 — Public: retail “event checkout” page**
  - **Goal:** Simple product list and checkout for QR-linked event sales.
  - **Work:**
    - Route `/retail/[eventSlug]` (non-discoverable; sharable via QR)
    - Display active products, quantities, email, stayAnon checkbox
    - Compute pricingBasis server-side (membership lookup by email)
    - Create order + Stripe checkout
  - **Done when:** Retail checkout works; orders & transactions appear in admin.

- [ ] **T053 — Public: event check-in page**
  - **Goal:** QR self check-in for identified attendees.
  - **Work:** Route `/check-in/[eventSlug]` requiring `code` param:
    - email input (required)
    - submit creates contact and eventAttendance row
  - **Done when:** Submitting creates an `eventAttendance` linked to the contact; invalid/missing code blocks check-in.

- [ ] **T054 — Public: membership status page (email → email result)**
  - **Goal:** Avoid leaking membership status publicly; send status via email (membership implies identity).
  - **Work:**
    - Route `/membership/status`:
      - email input
      - always show “If we have a membership associated with that email, we’ll send details.”
    - Backend:
      - lookup membership by email
      - send Brevo transactional email with current status
      - rate-limit + optional Turnstile (add later if needed; document hooks)
  - **Done when:** Submitting triggers an email for known members; UI response is constant regardless of membership existence.

---

## Phase 6 — Minimal admin workflows (testing + ops)

- [ ] **T060 — Admin: paper attendance entry + anonymous tally**
  - **Goal:** Let admins record paper attendance and anonymous counts quickly.
  - **Work:**
    - Ensure admin UI for `eventAttendances` supports:
      - creating a row with `anonymousCount` + method=paper
      - creating identified attendance by selecting a contact
  - **Done when:** Admin can record “+10 anonymous attendees” as one row.

- [ ] **T061 — Admin: cash transaction entry**
  - **Goal:** Treasurer can log cash/check retail/donation entries without contact.
  - **Work:**
    - Ensure `transactions` create UI is usable:
      - kind, amountUSD, paymentMethod=cash/check, optional event/campaign
      - stayAnon true by default for cash entries with no contact
  - **Done when:** Admin can log a cash donation without contact and it appears in the ledger list.

---

## Phase 7 — Privacy ops (export/anonymize by email)

- [ ] **T070 — Implement admin-only “export data by email” script**
  - **Refs:** `docs/design/identity-membership.md` section F
  - **Goal:** One command/script that gathers all records associated with an email.
  - **Work:**
    - Implement Node script in `scripts/` using Payload local API:
      - input: email
      - output JSON including:
        - contact
        - membershipAccounts/terms
        - subscriptions
        - attendances
        - linked orders/transactions (non-stayAnon)
  - **Done when:** Script produces a JSON file for a test email.

- [ ] **T071 — Implement admin-only “anonymize data by email” script**
  - **Goal:** Support deletion/anonymization while preserving ledger integrity.
  - **Work:**
    - For the contact:
      - delete OR anonymize fields (set displayName/phone/address null, keep email? policy decision)
    - For linked records:
      - unlink contact from orders/transactions/attendances where appropriate
      - NEVER modify stayAnon transactions (already unlinked)
    - Log actions performed.
  - **Done when:** Running against a test contact removes linkages and clears fields without breaking referential integrity.

---

## Phase 8 — Testing (smoke + a few high-value cases)

- [ ] **T080 — Add smoke tests for membership lookup + pricingBasis**
  - **Goal:** Prevent regressions in the core logic.
  - **Work:** Add unit tests (vitest) for:
    - email normalization
    - active membership lookup by email
    - pricingBasis selection for retail
  - **Done when:** Tests pass in CI locally.

- [ ] **T081 — Add webhook integration smoke tests (dev)**
  - **Goal:** Make webhook flows repeatable.
  - **Work:** Document and/or add a script to:
    - create checkoutIntent
    - simulate webhook payload (or use Stripe CLI commands)
  - **Done when:** Developer can repeat membership/donation/retail flows reliably in dev.

---

## Notes / MVP cut lines (explicit)
- Aliases are schema-ready but **not required** for launch.
- Turnstile/captcha can be added later; implement rate limiting first if needed.
- Admin UI can remain default Payload views except a basic dashboard list.
