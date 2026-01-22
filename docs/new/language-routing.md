# Language Routing

## Purpose
This document explains how the site resolves language, routes users, and persists locale selection. It is the source of truth for how `/`, `/en`, and `/es` behave.

## Supported Locales
- `en` (default)
- `es`

## Locale Resolution
Locale resolution uses the shared utility `@shna/shared/utilities/locale` with this priority:
1. `localStorage["shna-locale"]` (if present and valid)
2. `navigator.languages` (first supported locale found)
3. Fallback to `en`

## Routing Model
- `/` is a neutral entry point that renders English immediately on the server.
- After hydration, a client redirector resolves the preferred locale and canonicalizes the URL:
  - `es` -> `/es`
  - `en` -> `/en`
- All canonical content routes live under `/(site)/[lang]` (for example, `/en` and `/es`).

Notes:
- English users should not perceive a redirect.
- Spanish users may briefly see English before the canonical redirect completes.

## Locale Persistence
Locale persistence is centralized in `packages/shared/src/client/storage.ts`.
- Local storage key: `shna-locale`
- The root redirector sets the resolved locale before replacing the URL.
- `LocaleInit` runs on every `/(site)/[lang]` route and ensures local storage matches the active locale.
- On `/`, locale persistence is handled by the root redirector so existing stored values are not overwritten before canonicalization.
- Manual navigation (for example, the language toggle) also updates `shna-locale`.

## Attribution Ref Storage
Session ref storage is also centralized in `packages/shared/src/client/storage.ts`.
- Session storage key: `ref`
- `RefCapture` writes the ref into session storage; forms should read from session storage, not the URL.

## Non-Goals
- No middleware-based locale routing.
- No request-time Node server for the public site.
