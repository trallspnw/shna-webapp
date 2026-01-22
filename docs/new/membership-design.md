# Membership Design

This document defines the **v1 Membership feature** for the SHNA web application. It follows the same architectural standards, privacy posture, and request lifecycle as **donations** and **subscriptions**, and is intended to be used as a blueprint for implementation and future extension.

---

## Goals

* Support **Individual** and **Family** memberships with different prices
* Provide a **simple public UX**: enter contact info, select a plan, pay, receive confirmation
* Persist memberships reliably and privately
* Reuse existing **orders, order items, Stripe, email, polling, and webhook patterns**
* Avoid over‑engineering while leaving room for future expansion (retail, family members, renewals UI)

---

## High‑Level Flow

1. User submits membership form (contact info + plan selection)
2. Backend upserts Contact, validates eligibility, creates Order + Stripe session
3. User completes payment in Stripe
4. Stripe webhook confirms payment and creates Membership record
5. Receipt email is sent
6. Frontend polls order status and shows confirmation modal

This mirrors the **donations flow** end‑to‑end.

---

## Data Model

### MembershipPlans

Represents purchasable membership plans.

Fields (conceptual):

* `slug` (string, unique, e.g. `individual`, `family`)
* `name` (display name)
* `price` (number, local source of truth)
* `renewalWindowDays` (number)

Notes:

* Prices are stored locally (not in globals).
* Stripe is used only for payment processing, not pricing logic.

### Memberships

Represents a single membership term.

Fields (conceptual):

* `contact` (relationship → Contacts)
* `plan` (relationship → MembershipPlans)
* `startDay` (date, inclusive, Pacific Time)
* `endDay` (date, inclusive, Pacific Time)
* `campaign` (optional relationship → Campaigns)

Notes:

* No `publicId` for v1.
* No `isActive` field; activity is derived.
* Renewals create **new rows**, not updates.

---

## Active Membership Definition

A membership is considered active when:

```
startDay <= today <= endDay
```

* Date comparisons are **inclusive**.
* All logic is evaluated in **Pacific Time**.

---

## Membership Term Rules

* Memberships are **rolling, one‑year terms**.
* New membership:

  * `startDay = today`
  * `endDay = startDay + 1 year - 1 day`
* Renewal (allowed only within renewal window):

  * `startDay = previous.endDay + 1 day`
  * `endDay = startDay + 1 year - 1 day`
* If a membership is expired:

  * Renewal starts at **today** (no chaining).

---

## Submit API

### Endpoint

```
POST /memberships/submit
```

### Inputs

* `email` (required)
* `name` (required)
* `phone` (optional)
* `address` (optional)
* `planSlug` (required)
* `language` (optional)
* `ref` (optional string)
* `checkoutName` (optional string; Stripe line item label configured on the block)

### Behavior

1. Normalize email using existing utils.
2. Upsert Contact by email:

   * Create if missing.
   * Update only populated fields: `name`, `phone`, `address`, `language`.
   * Do **not** overwrite with empty values.
   * Do **not** upsert campaign on Contact.
   * Set `lastEngaged`.
3. Resolve `ref` → Campaign using existing utils.
4. Validate membership eligibility:

   * If active membership exists and renewal is > `renewalWindowDays` early → reject.
   * If expired → allowed.
5. Create Order + OrderItem(s):

   * Use existing order schema.
   * OrderItem `itemType = membership`.
6. Create Stripe checkout session (same pattern as donations).
7. Return redirect URL + public order identifier.

### Plan Options

Membership forms should render plan options from block configuration (no public fetch).
Plan selections should be relationships to `membershipPlans` so plan data stays in sync.

### Privacy

* Validation failures return generic errors.
* No membership existence details are exposed.

---

## Orders & Order Items

* Orders and OrderItems **must not be modified** unless strictly required.
* Membership purchases are represented as an Order with one or more OrderItems.
* `itemType` must support `membership` (add only if missing).

Orders serve as the **public polling spine**, identical to donations.

---

## Webhook Handling

Webhooks follow the standard pattern:

```
webhook handler → service → integrations
```

On successful payment confirmation:

1. Resolve Order using Stripe metadata (same as donations).
2. Create Membership record:

   * Link to Contact
   * Link to MembershipPlan
   * Apply Campaign (optional)
   * Compute `startDay` / `endDay`
3. Update Order to terminal "complete" state using existing order logic.
4. Send receipt email.

No pending membership state is created.

---

## Receipt Email

* Preferred template slug: `receipt-membership`
* If template is missing:

  * Use sensible default subject and body (same fallback behavior as donations).

Email payload includes:

* `price`
* `planName`
* `name`
* `emailAddress`
* `publicOrderId`

---

## Frontend UX & Polling

* Redirect and modal behavior mirrors donations exactly.
* Client polls order status using existing polling logic.
* Confirmation modal is shown when order reaches terminal state.
* No membership‑specific polling endpoint is introduced.

---

## Campaign Attribution

* Contact may have an existing campaign from initial creation.
* Membership may reference a **different campaign** derived from `ref`.
* Campaign attribution is **per‑membership**, not global to the contact.

---

## Future Extensions (Not Implemented in v1)

* Linking OrderItem → Membership directly
* Exposing membership identifiers via status endpoints
* Family member records and benefit sharing
* Retail item discounts based on active membership
* Membership management UI and renewal reminders

These are intentionally deferred.

---

## Implementation Notes

* Reuse existing Stripe and email utilities.
* Follow the donations blueprint for endpoints, services, validation, and polling.
* Implementation should **remove or clean up old membership remnants** (unused collections, endpoints, services, docs, UI blocks).

This design intentionally favors simplicity, consistency, and forward compatibility.
