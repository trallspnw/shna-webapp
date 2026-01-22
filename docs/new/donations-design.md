# Donations design

This document defines the **launch-day donation flow** and its supporting API and data model, following the same “gold standard” patterns used for subscriptions (see `docs/new/apis/api-feature-template.md` and related docs in this folder).

Scope: **donations only** (membership and retail purchases are future consumers of the same order model).

---

## Goals

- Provide a donation form block that:
  - collects donor details (minimal required fields)
  - creates a Stripe Checkout Session
  - redirects to Stripe for payment
  - returns to the originating page and shows a modal
  - polls until the donation reaches a terminal status
- Use **webhooks only** to finalize payment outcomes and send receipts.
- Keep the data model simple, auditable, and future-friendly for membership and retail.
- All monetary values are **USD dollars** in our app (decimals allowed). Convert to cents for Stripe only.

---

## Non-goals (launch day)

- Anonymous donations (future)
- Multi-item cart / unified receipt (future)
- Shipping / fulfillment state (future)
- Suggested donation amounts UX polish (future)

---

## End-to-end flow

### 1) Donation form

The donation form is a CMS block/component, similar to subscriptions.
Suggested amounts are optional CMS-configured values; if none are provided, the amount input is left blank unless a default is configured on the block.

**Field inputs:**
- email (required)
- name (single text field, optional)
- phone (optional)
- addressText (optional, unstructured)
- amountUSD (required; USD dollars, decimals allowed)

**Client also includes:**
- lang (from localStorage via existing language utils; fallback to en)
- ref (from sessionStorage via existing referral utils; optional)  
  Used only for attribution mapping to a campaign; not stored on the Order.
- checkoutName (optional string; Stripe line item label configured on the block)

All user-facing strings are configured on the block (like subscriptions).  
The API returns stable error codes; the UI maps codes to block strings.

---

### 2) Public donations API

Endpoint: POST /api/public/donations/submit

**Server responsibilities (in order):**
1. Validate request.
2. Resolve attribution from ref by mapping it to a campaign (mirrors subscriptions behavior).  
   ref itself is not persisted.
3. Upsert Contact by email.
4. Create an Order (status = created).
5. Create a Stripe Checkout Session with a success URL that includes:
   - publicOrderId
   - stripeRedirect=1
   - modal=donation
   The cancel URL should return to the entry page without these params.
6. Persist Stripe identifiers onto the Order.
7. Return redirect URL.

---

### 3) Stripe Checkout redirect → modal + polling

Stripe redirects back to the same page on both success and cancel.

The donation modal opens only when:
- publicOrderId is present
- stripeRedirect=1
- modal=donation

The modal polls GET /api/public/orders/status?publicOrderId=<uuid> until terminal.
Cancel returns to the entry page quietly (no modal) and the order remains in `created` status until it expires.

---

### 4) Webhook finalization

Webhooks are the source of truth.

Key events:
- checkout.session.completed → mark order paid, create Transaction, send receipt
- checkout.session.expired → mark order expired

---

## Order model

### Order

- publicId (uuid)
- status: created | paid | expired | error
- contact (required for launch)
- campaign (optional)
- lang
- totalUSD
- stripeCheckoutSessionId
- stripePaymentIntentId (optional)
- receiptEmailSendId (optional)
- createdAt / updatedAt (Payload-managed)

### OrderItem

- order (relationship)
- itemType: donation | membership | retail
- label
- unitAmountUSD
- qty (integer)
- totalUSD

### Transaction

- order (relationship)
- contact (optional)
- amountUSD
- paymentType: stripe | cash | check
- stripeRefId
- createdAt

---

## Validation

### Email
- required
- normalized
- privacy-safe

### AmountUSD
- required
- > 0
- <= maxDonationUSD
- max 2 decimal places
- validated as string, converted safely

---

## Globals

- maxDonationUSD (default 10000)  
  Prevents mistakes/abuse.

---

## Stripe notes

- Use Stripe Checkout Sessions
- Set locale from lang when supported
- Fulfillment via webhooks only
- Handlers must be idempotent

---

## Email receipts

- Sent via webhook on success
- receiptEmailSendId stored on Order (best-effort)
- Includes publicOrderId

---

## Future extensions

- Anonymous donations
- Suggested donation amounts
- Unified cart / receipts
