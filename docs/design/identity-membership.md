# Identity & Membership Design Notes

> Originally `docs/planning/plan.txt`. Kept as a living design doc.

## Overview

This document captures key **identity, privacy, and membership** design decisions and the data flows built on top of them. It is descriptive (not prescriptive code) and should remain consistent with `ARCHITECTURE.md` and `DECISIONS.md`.

---

## Identity & privacy model (pattern)

We treat **identity as a mode per record**, not a single global enum.

### Identity modes

- **Identified**
  - Record links to a `contact`
  - Email is stored
  - Used for membership and communications

- **Alias** (future)
  - Record links to an alias
  - Pseudonymous
  - No email

- **Anonymous**
  - No identity link
  - In some cases represented via aggregate counters

### Option A (selected)

If a user checks **“Stay anonymous”** during donation or retail checkout, we do **not**:

- link to an existing contact
- store their email or name
- update engagement timestamps on any contact

We **do** still store:

- Stripe IDs
- transaction amounts
- attribution metadata (campaigns, events)

These are required for reconciliation and analytics.

---

## Why `membershipTerms` exists

- `membershipPlans` → *what you sell*
- `membershipAccounts` → *who it applies to*
- `membershipTerms` → *when coverage is valid (and at what price)*

Each renewal creates a **new term**, enabling:

- clean renewals and plan switching (e.g., household → individual)
- audit history (refunds, comped terms, pricing changes)
- simple “is active?” queries via date ranges

---

## Anonymous members on membership accounts

To reduce child PII and avoid rigid modeling:

- secondary members can be named `contacts` (adult household members)
- `anonymousMemberCount` covers unnamed members
- (future) aliases may represent pseudonymous named members

---

## Events & attendance

- `events` is the canonical source for:
  - public pages
  - analytics

- `eventAttendances` is:
  - usually one row per attendee
  - **except** anonymous attendance, which may be a single aggregate row via `anonymousCount`

We intentionally avoid `partySize` for now in favor of individual sign-ins.

---

## Draft data flows

### A) Membership purchase (requires Contact)

1. User completes membership form (email required).
2. System upserts `contacts`:
   - normalized email
   - language set from current site language
3. System creates or updates `membershipAccounts`:
   - set `primaryContact`
   - optionally add `secondaryContacts`
   - optionally set `anonymousMemberCount`
4. System creates Stripe checkout session.

**Webhook on success:**

- create `transactions`
  - `kind = membership`
  - `paymentMethod = stripe`
  - `status = paid`
- create `membershipTerms`:
  - `startsAt = now` **or** existing term’s `expiresAt` (renewal)
  - `expiresAt = startsAt + durationMonths`
  - snapshot:
    - `planKeySnapshot`
    - `pricePaidUSD`
  - link `transactionId`

Membership verification uses:
`contacts.email → latest active membershipTerms for that contact’s account`.

---

### B) Membership renewal & plan switching

1. User triggers renewal within renewal window.
2. System finds active term for their `membershipAccount`.

**On payment success:**

- create new term with:
  - `renewedFromTermId = priorTermId`
  - `startsAt = prior.expiresAt`
  - `planId` may differ (plan switch)

Optionally:
- update `membershipAccount.type` to match latest intent  
  *(or derive dynamically)*

---

### C) Donation checkout (receipt-only optional)

1. User enters email for Stripe receipt.
2. User optionally selects **Stay anonymous**.
3. System computes attribution (campaign/event) without requiring a contact.

**Webhook on success:**

- create `transactions`
  - if `stayAnon = true`:
    - no `contactId`
    - no stored email
  - else:
    - optionally link to contact (if opt-in later allowed)

Reconciliation and analytics rely on:
`transactions + campaignId + eventId`.

---

### D) Retail checkout (member pricing + receipt-only)

1. User selects products → create `orders` + `orderItems` (`pending`).
2. Checkout collects email for receipt and Stay anonymous option.

**Pricing logic:**

- if email maps to active membership → member pricing
- else → non-member pricing

Store:
- `orders.pricingBasis` (`member` / `non_member`) for analytics

**Webhook on success:**

- create `transactions`
  - `kind = retail`
  - link `orderId`
  - store Stripe IDs
- set `orders.status = paid`
- if `stayAnon = true`:
  - do not link order or transaction to contact
  - do not store email

---

### E) Event check-in (QR + paper)

#### QR self check-in (identified)

1. QR → `/check-in/<eventSlug>?code=<checkInCode>&ref=...`
2. User enters email.
3. Contact is created or reused (language from site context).
4. Create `eventAttendances` linked to contact.

#### Paper tally (anonymous)

1. Admin records “+10 anonymous attendees”.
2. Create single `eventAttendances` row:
   - `anonymousCount = 10`
   - `method = paper`

---

### F) Data export / deletion by email (admin-only)

1. Lookup `contacts` by normalized email.
2. Export related records by traversing:
   - `membershipAccounts` (primary + secondaries)
   - `membershipTerms`
   - `subscriptions`
   - `eventAttendances`
   - orders / transactions (only if non-anonymous and linked)

**Anonymize / delete per policy:**

- preserve ledger integrity:
  - transactions anonymized (unlink contact, strip PII if present)
- preserve attendance totals:
  - unlink contact where required

---

## Minimal launch-scope knobs (deferrable)

- **Aliases**
  - Can be omitted at launch
  - Keep `aliasId` nullable in:
    - `eventAttendances`
    - `membershipAccounts.aliases`

- **Campaigns**
  - Start as raw `ref` strings
  - Relationship model can be added later without breaking flows

- **Orders**
  - Initial model: order + items + paid status
  - Fulfillment and admin live views can be added later
