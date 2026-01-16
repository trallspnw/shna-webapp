# AI Implementation Guidelines

Quick reference for future AI/codegen work in this repo.

- Prefer shared configuration over per-block strings: form labels, validation errors, and other reused text should live in Payload globals; blocks should only carry placement-specific copy. Provide sensible code defaults when globals are absent.
- Maintain schema/validation parity: client-side checks must mirror API/Prisma rules; keep enum/type sources single-sourced from generated types when possible.
- Avoid regressions in payment flows: membership/donation code paths must preserve Stripe metadata, webhooks, and localized receipts.
- Keep UX stable across locales: always use `resolveLocalizedText`/language hooks for user-facing text and currency/date formatting.
- Respect existing patterns: use Mantine components already in use, avoid introducing new UI libs, and match established styling modules.
- Tests when touching APIs: update/add unit tests for new request/response shapes, especially for membership and webhook handlers.
