# Subscriptions Design (Business Logic)

> Purpose: Describe the *intentional* design of subscriptions in the CMS so future contributors (human or AI) can validate, extend, or refactor safely.
>
> This document complements `cms-api-structure.md`. Read both together.

---

## High-level goals

* Privacy-first: avoid user enumeration and over-specific error responses.
* Idempotent by default: repeated requests should be safe.
* Simple data model: delete instead of retaining inactive records.
* Clear separation of concerns:

  * Collections = invariants + schema
  * Services = business rules
  * Endpoints = request/response glue

---

## Core concepts

### Client form requirements

* Public subscription forms must read `ref` from session storage via the shared helper (do not read from URL params).
* Send `lang` from the `shna-locale` local storage key, with a fallback of `en` when missing.

### Contact

A **Contact** represents an email identity known to the system.

Key properties:

* `email` (normalized, unique)
* `language` (optional)
* `campaign` (optional, first-touch attribution)
* `lastEngagedAt` (updated on meaningful interactions)

Design principles:

* Contacts are created lazily (on first meaningful interaction).
* Existing contacts are *updated*, not replaced.
* Campaign attribution on contacts is **write-once** (first-touch only).

---

### SubscriptionTopic

A **SubscriptionTopic** represents a logical email list (e.g. `general`).

Key properties:

* `slug` (stable identifier)
* `name` / `description`

Design principles:

* Topics must exist in CMS before use.
* Topics are referenced by `slug` at API boundaries.
* No hard-coded topics in code; `general` is just the initial default.

---

### Subscription

A **Subscription** is a join record between a Contact and a SubscriptionTopic.

Key properties:

* `contact` (relationship)
* `topic` (relationship)
* `campaign` (optional; best-effort attribution)
* `key = contactId:topicId` (enforces uniqueness)

Design principles:

* One row per (contact, topic).
* No `status` field:

  * Subscribed = row exists
  * Unsubscribed = row deleted
* This favors simplicity, GDPR alignment, and free-tier storage limits.

---

## Campaign attribution (`ref`)

### Source of truth

* Campaigns are defined in CMS with a stable `reftag`.
* Client may provide a `ref` string.

### Resolution rules

* Resolution is **best-effort** and non-blocking.
* If `ref` is:

  * missing / empty / invalid → ignore silently
  * valid but no campaign found → log a warning and proceed

### Attribution rules

* On **contact creation**:

  * set `campaign` if resolved
* On **contact update**:

  * never overwrite existing campaign
* On **subscription creation**:

  * set `campaign` if resolved

This allows later analysis of both first-touch (contact) and per-subscription attribution.

---

## API actions

All subscription mutations are driven through a single endpoint.
`POST /api/public/subscriptions/submit`

Note: `/api/subscriptions` is the Payload collection REST namespace (admin CRUD). Public form submissions must use `/api/public/...` to avoid route collisions.

### Supported actions

* `subscribe`
* `unsubscribeAll`
* `update` (stub only, future)

---

## Subscribe behavior

Input (conceptual):

* `email` (required)
* `topics[]` (required)
* `ref` (optional)
* `lang` (optional)

Flow:

1. Normalize + validate email.
2. Resolve topics by slug.

   * If any topic does not exist → validation error.
3. Resolve campaign from `ref` (best-effort).
4. Contact upsert:

   * Create if missing.
   * Update `language` (if provided).
   * Update `lastEngagedAt`.
   * Never overwrite existing contact campaign.
5. Subscription upsert:

   * Create missing subscriptions.
   * Existing subscriptions are treated as success (idempotent).

Guarantees:

* Safe to retry.
* No duplicate subscriptions.
* No user enumeration.

---

## UnsubscribeAll behavior

Input (conceptual):

* `email` (required)

Flow:

1. Normalize + validate email.
2. Look up contact.

   * If none exists → success (no-op).
3. Update `lastEngagedAt`.
4. Delete all subscription rows for the contact.

   * If none exist → success (no-op).

Guarantees:

* Safe to retry.
* Does not reveal whether the email was subscribed.

---

## Update behavior (future)

Reserved for:

* Manage-subscriptions page
* Per-topic toggles
* Unsubscribe-from-all shortcut

Current state:

* Service + endpoint stub only
* Returns a stable "not implemented" response

---

## Privacy & response strategy

* Endpoints return **generic success responses**.
* Never reveal:

  * Whether an email exists
  * Which topics a user is subscribed to
* Detailed outcomes are confined to service layer + logs.

---

## Error handling philosophy

| Layer      | Responsibility                 |
| ---------- | ------------------------------ |
| Collection | Schema validation, invariants  |
| Service    | Business rule validation       |
| Endpoint   | HTTP status + response shaping |

* Validation errors → 400
* Not implemented → 501
* Unexpected failures → 500

---

## Idempotency notes

* Idempotency is logical, not byte-perfect.
* Timestamps (`lastEngagedAt`, `updatedAt`) may change on retries.
* This is acceptable and intentional.

---

## Out of scope (tracked separately)

* Rate limiting / abuse prevention
* Email confirmation flows
* Preference center UX
* Analytics aggregation

---

## Reader checklist (for future review)

When reviewing changes, ask:

* Does this leak user existence?
* Does this add state that could be deleted instead?
* Is campaign attribution still best-effort?
* Are retries safe?
* Is logic duplicated outside the service layer?

If the answer to any is "yes", reconsider the change.
