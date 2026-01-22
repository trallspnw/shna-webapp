# API Feature Template (Gold Standard)

## Purpose
This document defines the **gold-standard pattern** for implementing business APIs in this codebase.
It is intended to be **copied and adapted** for new features.

The subscriptions feature is the reference implementation for this template.

This pattern ensures:
- Clear separation between CRUD and business actions
- Stable, privacy-safe API contracts
- Consistent FE → API → service → collection flow
- Low-risk replication for future features

---

## High-Level Flow

```
Frontend UI
  → POST /api/public/<feature>/<action>
    → Endpoint (validation + sanitization)
      → Service (business rules)
        → Collections (data + invariants)
```

---

## Namespace & Routing Rules

### Collection REST (Payload-managed)
- Path: `/api/<collection>`
- Purpose: **admin and internal CRUD only**
- Owned by Payload
- Never called directly by frontend UI

### Public Business APIs (FE-facing)
- Path: `/api/public/<feature>/<action>`
- Registered globally in `payload.config.ts`
- Used by frontend UI and public forms
- Must never collide with collection REST paths

**Rule**
> CRUD lives under collection REST.  
> Business actions live under `/api/public/*`.

---

## Frontend Responsibilities

**Location**
- Shared blocks or FE components (e.g. `packages/shared/src/blocks/*`)

**Responsibilities**
- Render minimal UI
- Keep client-side validation light
- Never touch collection REST APIs
- Never read attribution data directly from the URL

**Client data sourcing**
- User input (e.g. email)
- Attribution (`ref`) from **sessionStorage**
- Locale (`lang`) from **localStorage**
- Feature configuration from block fields

**Request example**
```json
{
  "action": "<action>",
  "email": "user@example.com",
  "ref": "campaign-ref",
  "lang": "en"
}
```

---

## Endpoint Layer

**Location**
- `apps/cms/src/endpoints/<feature>.ts`
- Registered in `apps/cms/src/payload.config.ts`

**Responsibilities**
- Parse and validate request shape
- Reject unsupported actions
- Sanitize all error responses
- Log structured context server-side
- Delegate all business logic to services

**Response envelope**
- Success: `{ "ok": true }`
- Client error: `{ "ok": false, "error": "bad_request" }`
- Server error: `{ "ok": false, "error": "server_error" }`

**Rules**
- Never return Payload validation structures
- Never expose internal error details to FE

---

## Service Layer

**Location**
- `apps/cms/src/services/<feature>/service.ts`

**Responsibilities**
- All business rules and invariants
- Idempotency guarantees
- Privacy-safe behavior
- Best-effort enrichment (e.g. campaign attribution)

**Rules**
- Services must not know about HTTP
- Services may throw typed errors consumed by endpoints

---

## Collections & Invariants

**Responsibilities**
- Enforce data integrity only
- Use `beforeValidate` hooks for required computed fields
- Prevent invalid state transitions

**Rules**
- No business logic in collections
- No FE assumptions in collections

---

## Testing Strategy

### Integration Tests (Required)
- Call `/api/public/<feature>/<action>`
- Assert:
  - success path
  - privacy-safe behavior
  - stable response envelope
  - no Payload internals leaked

### Unit Tests (Optional)
- Service logic
- Pure helpers

**Rule**
> Integration tests are the source of truth for API behavior.

---

## Replication Checklist

For every new feature:

1. Write `<feature>-design.md`
2. Add `/api/public/<feature>/<action>` endpoint
3. Implement service logic
4. Enforce invariants in collections
5. Add integration tests
6. Update docs

If a feature deviates from this template, the deviation must be documented explicitly.

---

## Reference Implementation
- Subscriptions feature
