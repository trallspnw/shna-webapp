# CMS API Structure: Endpoints, Services, Collections

This repo keeps **all runtime API code in `apps/cms`**. The public site (`apps/site`) calls the CMS over HTTP.

The goal of this structure is to keep changes **small, reviewable, and AI-friendly** by separating:
- HTTP contract concerns (endpoints)
- business rules (services)
- data integrity + authorization (collections)

---

## Layer Overview

### 1) Collections (Payload Collection Configs)
**Purpose:** Define the data model and enforce **invariants**.

**Where:**
- `apps/cms/src/collections/*`

**Responsibilities:**
- Schema: required fields, field types
- **Normalization** (e.g., email lowercasing, slug normalization on create)
- **Uniqueness** constraints (e.g., `contacts.email`, `subscriptions.key`)
- **Immutability** rules (e.g., topic slug, campaign reftag, subscription identity fields)
- **Derived fields** (e.g., subscription `key` = `contactId:topicId`
- **Access control** (who can read/write collections)

**Rule of thumb:**  
If a rule must hold no matter *how* data is written (admin UI, API endpoint, scripts, webhooks), it belongs here.

---

### 2) Services (Business Logic Layer)
**Purpose:** Implement business rules in a reusable way, independent of HTTP.

**Where (recommended):**
- `apps/cms/src/services/<domain>/*`

Examples:
- `apps/cms/src/services/subscriptions/service.ts`
- `apps/cms/src/services/subscriptions/types.ts`

**Responsibilities:**
- Business rules and workflows
  - Resolve required entities (e.g., topic by slug)
  - Find or create contacts
  - Create/delete subscriptions
  - Idempotency decisions (“already subscribed” is ok)
- Interpret DB/collection errors into domain errors
- Log domain-level failures (misconfiguration, unexpected states)

**Non-responsibilities:**
- No HTTP response handling
- No parsing request bodies
- No direct assumptions about routing or URL structure

**Rule of thumb:**  
Services should be callable from multiple entry points (endpoints, cron, scripts) without duplicating business logic.

---

### 3) Endpoints (HTTP Handlers / API Contract Layer)
**Purpose:** Define the HTTP API contract and map requests to services.

**Where:**
- `apps/cms/src/endpoints/*`

Mounted by Payload config (example):
```
endpoints: [
  { path: '/subscriptions', method: 'post', handler: subscriptionsHandler },
]
```

**Responsibilities:**
- Method routing (e.g., POST only)
- Parse and validate request shape (basic input validation)
- Call service functions
- Map service/domain errors → HTTP status codes
- Return stable response shape (e.g., ```{ ok, message, fieldErrors? }```)

**Non-responsibilities:**
- No direct DB logic in handlers (other than calling services)
- No enforcing collection invariants in endpoints

**Rule of thumb:**  
Endpoints should stay *small*. If a handler grows, push logic down into services.

---

## Validation: What Goes Where

### Collections validate **data integrity**
Examples:
- Required fields
- Uniqueness
- Immutability
- Derived fields (computed `key`)
- Normalization

These protect the database regardless of who writes.

---

### Endpoints validate **request shape**
Examples:
- Required request fields exist (e.g., `email`, `action`)
- Basic email sanity checks (format, length)
- Reject unknown actions early
- JSON parsing / content-type issues
- Request size limits (optional)

Endpoints should NOT duplicate invariants enforced by collections.

---

### Services validate **business intent**
Examples:
- Required configuration exists (e.g., topic `general` must exist)
  - If missing: log error, throw misconfigured → endpoint returns 500
- Campaign reftag exists (if provided)
  - If missing: typically treat as 400 (“bad client input”)
- Idempotency decisions
  - Subscribe when already subscribed → treat as success

Services should not care about HTTP; they throw domain errors.

---

## Access Control: Where It Belongs

### Collections are the source of truth for authorization
Access rules belong in collection configs:
- Who can read/update/delete contacts/subscriptions
- Prevent public reads of sensitive data
- Prevent non-admin mutation via admin UI
- Lock down system fields (readOnly, hooks)

Endpoints should not rely on “security by endpoint only”.
Even internal scripts should not be able to violate invariants or authorization rules.

---

## Error Handling Strategy

### Services throw domain errors
Define small error types (example):
- `BadRequestError` (maps to HTTP 400)
- `MisconfiguredError` (maps to HTTP 500)
- `UnauthorizedError` (maps to HTTP 401/403)

### Endpoints map errors to HTTP
Endpoints should:
- Return consistent response shape
- Avoid leaking internal details
- Log unexpected errors

Example response:
```
{ "ok": false, "message": "Invalid email." }
```

---

## Example: Subscription Flow (Current)

**Invariants (collections):**
- `subscriptions.key` is unique (`contactId:topicId`)
- `contact/topic` cannot be changed after creation
- `subscriptionTopics.slug` is create-only
- `campaigns.reftag` is validated + create-only

**Endpoint (`/subscriptions`, POST):**
- Validate body shape (`action`, `email`)
- Call service (`subscribeGeneral(email, campaignReftag?)`)

**Service:**
- Resolve topic slug `general`
  - If missing: log + throw misconfigured
- Find/create contact by normalized email
- Create subscription
  - If duplicate key: treat as success (already subscribed)

---

## Naming Conventions

- `collections/*` → schema + invariants + access
- `services/<domain>/*` → workflows and business rules
- `endpoints/*` → HTTP handlers only
- `lib/*` → utilities/helpers (avoid putting business rules here long-term)

Note: `lib/` can become a “junk drawer”. Prefer `services/` for business logic.
