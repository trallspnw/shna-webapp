# Lessons Learned

This doc captures short, durable notes from implementation work that are useful
later. Keep it concise and update only when a lesson is repeatable.

## Static export + media

- Static export must not depend on CMS runtime routes. Media URLs that point to
  `/api/media/file/*` will break when the CMS is stopped.
- Media now lives in Cloudflare R2 and is referenced by absolute URLs, so the
  static export no longer needs to copy files locally.
- If media storage changes again, ensure the frontend keeps using externally
  reachable URLs so the public site stays static-only.

## Env + URLs

- Static export and sitemap generation require a stable public site URL. Set
  `NEXT_PUBLIC_SITE_URL` in CI and Cloudflare Pages.
- The CMS base URL is `NEXT_PUBLIC_CMS_URL`. Keep it consistent across docs and
  scripts to avoid split-brain routing.

## Site runtime behavior

- Static site pages are fully static after export, but search results are fetched
  client-side from the CMS API. Search is not offline without CMS.

## Type generation

- `packages/shared/src/payload-types.ts` is used by both apps. The site app
  excludes it from TS checks and uses a minimal `payload` module shim to avoid
  augmentation errors.

## Test Mode

Test mode is for internal ops testing, not marketing demos.

- **Definition:** Operational records created/handled in the same deployment and DB, flagged with `isTest: true`.
- **Activation:** Append `?mode=test` to a URL.
- **Persistence:** Once enabled, test mode remains active for the browsing session and is carried across internal links.
- **Stripe:** Use Stripe test keys (and test webhook secret when applicable) when test mode is active.
- **Admin UX:** Provide a **Show test data** filter and a **Delete all test records** action when viewing test data.
