# Email System v1 – Design

## Status

**Proposed / Ready for implementation**

This document defines the initial (v1) email architecture for the project, covering **transactional** and **broadcast** emails at launch.

The design intentionally prioritizes:

* low operational complexity
* Payload-controlled content
* safe, non-fatal behavior
* clear auditability

Advanced features (scheduling, segmentation, A/B testing, click tracking) are explicitly out of scope.

---

## Goals

1. All email content (transactional and broadcast) is **controlled in Payload**, not in Brevo.
2. Transactional emails are sent **inline** from existing business flows.
3. Broadcast emails can be sent manually to a subscribed audience.
4. Email sending **never blocks** core business logic.
5. Every send attempt is recorded for audit/debugging.
6. Links in broadcast emails may include a simple `?ref=` attribution tag.
7. Subscriptions are managed **locally only** (Brevo is delivery-only; no ESP list sync).

---

## Non-Goals (v1)

* Scheduling or delayed sends
* Audience segmentation beyond topic subscription
* A/B testing
* Per-recipient click tracking
* Brevo-side template management
* ESP list sync for subscriptions

---

## Test Mode

* Test-mode emails are **still sent**.
* The email provider applies a `[TEST]` subject prefix when `isTest: true`.

---

## Conceptual Model

### Email Types

* **Transactional**

  * Triggered by business events (membership creation, donation, status lookup)
  * Must exist and be editable
  * Never include `?ref` parameters

* **Broadcast**

  * Informational updates sent to a topic audience
  * Manually triggered
  * Links may include `?ref=email:<broadcastSlug>`

---

## Collections

### 1) EmailTemplates

Source-of-truth for all email content.

Key fields:

* `key` (string)
* `category` (`transactional | broadcast`)
* `isSystem` (boolean; true for transactional templates)
* `subject` (localized)
* `body` (localized rich text or blocks)
* `requiredParams` (array of strings, optional)
* `enabled` (boolean)
* `previewData` (json, optional)

Rules:

* `isSystem=true` templates:

  * cannot be deleted
  * `key` cannot be changed
* Missing or disabled templates do **not** block business logic; sends fail gracefully.

---

### 2) EmailBroadcasts

Represents a single informational/broadcast send.

Key fields:

* `slug` (string, required, immutable once sent)
* `title` (admin-facing)
* `template` → EmailTemplates (must be `category=broadcast`)
* `topic` → SubscriptionTopics
* `status` (`draft | sending | sent | failed`)
* `dryRun` (boolean)
* `stats`:

  * `targetCount`
  * `sentCount`
  * `failedCount`
* `notes` (internal)
* timestamps

Rules:

* Broadcasts are **manually triggered** (send-now only)
* No scheduling in v1
* Slug is used for `?ref=` attribution

---

### 3) EmailSends

Per-recipient audit log.

Key fields:

* `template` → EmailTemplates
* `broadcast` → EmailBroadcasts (optional)
* `to` (email address)
* `contact` → Contacts (optional)
* `status` (`queued | sent | failed | skipped`)
* `failureReason` (`template_missing | validation_error | provider_error | disabled | duplicate`)
* `provider` (default: brevo)
* `providerMessageId` (optional)
* `dedupeKey` (string)
* `payload` (json snapshot of variables)
* related entities (optional): order, transaction, membership
* timestamps

---

## Sending Flow

### Transactional

1. Business flow completes successfully
2. `sendTransactionalEmail()` helper is called inline
3. Template is resolved by `key`
4. Params validated (best-effort)
5. EmailSend record created (`queued`)
6. Brevo transactional API called
7. EmailSend updated to `sent` or `failed`

Failures never block the business operation.

---

### Broadcast

1. Admin creates EmailBroadcast (draft)
2. Optional dry run shows target count
3. Admin triggers send-now action
4. Audience resolved from active Subscriptions for topic
5. For each recipient:

   * EmailSend created
   * Brevo API called
6. Broadcast stats updated

---

## Link Attribution (`?ref=`)

* Only applied to **broadcast** emails
* Format: `?ref=email:<broadcastSlug>`

A shared URL utility is responsible for:

* appending `ref` correctly
* handling existing query strings
* preserving fragments

Admins never manually edit query strings.

---

## Operational Guarantees

* No email send causes a fatal error
* All send attempts are visible in admin
* Transactional templates are protected from deletion
* Broadcasts are immutable after sending

---

## Future Extensions (Not Implemented)

* Scheduled broadcasts (`sendAt`)
* Campaign-style grouping
* Click tracking
* Advanced segmentation

---

## Source of Truth

This document defines the v1 email system.
If code or docs conflict with this design, **this document wins**.
