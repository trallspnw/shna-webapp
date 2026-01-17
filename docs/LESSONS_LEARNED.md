# Lessons Learned

This doc captures short, durable notes from implementation work that are useful
later. Keep it concise and update only when a lesson is repeatable.

## Static export + media

- Static export must not depend on CMS runtime routes. Media URLs that point to
  `/api/media/file/*` will break when the CMS is stopped.
- The current workaround copies CMS media from `apps/cms/public/media` to
  `apps/site/public/media` during export (`pnpm sync:media`). This assumes local
  disk storage.
- If media moves to R2/S3 or another external store, replace `sync:media` with a
  build-time download or switch the frontend to use the external media origin.

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
