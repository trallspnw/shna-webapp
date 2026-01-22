# Email design

This document defines the **email system foundation** for SHNA, including:
- email templates (system emails)
- email sends (audit trail of sending)
- rendering (RichText → HTML/Text) with placeholders

Broadcasts are intentionally **out of scope** for this doc (see TODO).

---

## Goals

- Support **system emails** (e.g., donation receipts, membership confirmations) using templates in CMS.
- Author template bodies in **localized RichText** (Payload) with localized subject.
- Render emails to:
  - **HTML** (primary)
  - **plain text** (fallback)
- Support **placeholders** now (needed for receipts).
- Keep the rendering pipeline extensible so we can add additional renderers later (e.g., blocks).

---

## Non-goals (for now)

- Broadcast design/execution (audience selection, scheduling, approvals, rate limiting)
- Block-based / component-based email authoring
- Delivery tracking (opens/clicks), bounce handling, unsubscribe mechanics

---

## Collections

### EmailTemplates

Purpose: CMS-managed templates used by the backend to send system emails.

Recommended fields:

- `slug` (text, required, unique)  
  - e.g. `receipt-donation`, `receipt-membership`, `membership-confirmation`
- `name` (text, required)
- `description` (textarea, optional)
- `status` (select: `active | disabled`, default `active`)

Localized content (must follow the same localization pattern as Pages):
- `subject` (text, localized: true)  
  - hooks: `clearEmptyLocalizedText`  
  - validate: `requireDefaultLocale`
- `body` (richText, localized: true)  
  - hooks: `clearEmptyLocalizedText`  
  - validate: `requireDefaultLocale`

Placeholders (generic):
- `placeholders` (array, optional)
  - each row:
    - `key` (text, required) e.g. `amountUSD`, `orgName`
    - `description` (text, optional)

Notes:
- Templates should not be donation-specific; they are generic assets.
- The template’s `placeholders` list is a **declarative contract** (documentation + validation).

---

### EmailSends

Purpose: durable record of email sends for audit/debugging and referencing from Orders.

Minimal recommended fields:

- `template` (relationship to EmailTemplates, optional)
- `source` (select: `template | inline | unknown`, default `template`)
- `templateSlug` (text, optional)
- `subject` (text, optional; used for inline sends)
- `toEmail` (text, required)
- `contact` (relationship to Contacts, optional)
- `lang` (text/select, optional) — locale used for render/send
- `status` (select: `queued | sent | failed`, default `queued`)
- `providerMessageId` (text, optional) — any id returned from the provider (e.g., Brevo)
- `sentAt` (date, optional)
- `errorCode` (select: `missing_recipient | template_not_found | missing_placeholders | provider_failed`, optional)
- `error` (textarea/json, optional)

Notes:
- Validation: **either** `template` **or** `subject` must be present.
- Orders should store a best-effort reference to the EmailSend id (string or optional relationship),
  but Orders must remain valid if EmailSends are pruned.

---

## Rendering

Templates are authored in RichText. We need a renderer to produce HTML and plain text.

### Rendering API (internal)

All email rendering must go through a single entrypoint so we can swap implementations later:

- `renderEmail({ template, locale, params }) -> { subject, html, text }`

Where:
- `template` includes localized subject + localized richText body
- `locale` is the chosen locale (e.g., `en`, `es`)
- `params` is a dictionary of placeholder values

### Renderer pipeline

1) **Select localized variant**
   - Use language via existing utils; fallback to default locale.

2) **Placeholder validation (optional but recommended)**
   - If `template.placeholders` exists:
     - ensure each declared placeholder `key` exists in `params`
     - otherwise throw a stable error (server-side)

3) **RichText render**
   - Render RichText → HTML for `output=html`
   - Render RichText → plain text for `output=text` (strip/serialize)

4) **Placeholder substitution**
   - Replace placeholder tokens in the rendered subject/body:
     - token format: `{{key}}`
   - Substitution should be safe and predictable:
     - for HTML output: escape values unless you explicitly allow raw HTML (do not allow raw HTML for now)
     - for text output: plain replacement

This order (render, then replace) works well because placeholders most commonly appear inside text nodes.

### Extensibility for future renderers (blocks)

We will add additional body modes later (e.g., `blocks`), without changing call sites, by implementing renderer adapters behind the same entrypoint:

- `RichTextRenderer` (now)
- `BlocksRenderer` (future)
- potentially `HtmlTemplateRenderer` (future)

The entrypoint chooses the renderer based on template configuration (future) or field type.

---

## Placeholder conventions

- Placeholder token format: `{{key}}`
- Keys should be camelCase:
  - `amountUSD`, `receiptNumber`, `orgName`, `donorName`
- Values are always provided by the backend.
- Do not allow templates to execute code or conditional logic (future enhancement).

---

## Locale selection

- System emails choose locale based on the relevant business object:
  - Order `lang` if present
  - else Contact preferred language if present
  - else default locale (`en`)
- The locale used for sending should be stored on EmailSend.

---

## Broadcasts (TODO)

Broadcast design is explicitly deferred.

TODO topics for later:
- audience selection (subscriptions topics, manual lists, segmentation)
- throttling/rate limiting
- preview + test send
- scheduling
- localization strategy for broadcasts
- unsubscribe handling and compliance

---

## Implementation notes

- Keep renderer code isolated (e.g., `apps/cms/src/services/email/rendering/*` or a shared package).
- Avoid mixing provider concerns (Brevo/SMTP) with templating/rendering.
- Email sending should:
  1) create EmailSend (queued)
  2) render content via renderer entrypoint
  3) send via provider adapter
  4) update EmailSend (sent/failed)
  5) return EmailSend id for linkage (e.g., Order.receiptEmailSendId)

Current fallback behavior:
- Missing template or missing placeholders → send inline fallback content and record EmailSend with `source=inline`.
- Missing recipient → record failed EmailSend and skip provider call.
- Provider message IDs are captured on EmailSend when available (Brevo).
