# Disabled Features

This doc tracks features that are currently disabled and how to re-enable them.
Keep it short and update only when a feature is intentionally toggled off.

## Search

Status: disabled end-to-end (UI, routes, plugin).

What was disabled
- Header search link removed and `/search` routes deleted in both site + CMS apps.
- Payload search plugin removed from CMS config.
- Search-related admin import map entries removed by regeneration.

How to re-enable
- Re-add the search plugin in `apps/cms/src/plugins/index.ts` and include the search overrides.
- Restore the search UI and routes (previously in `packages/shared/src/search/Component.tsx` and `apps/*/src/app/(frontend)/search`).
- Add `/search` back to the sitemap if desired: `apps/cms/src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`.
- Add/restore search schema overrides and beforeSync hook as needed.

## Theme Toggle (Light/Dark)

Status: removed (no UI or theme initialization).

What was disabled
- Theme provider, InitTheme script, and footer ThemeSelector removed.
- `data-theme` is now pinned to `light` in both site and CMS layouts.

How to re-enable
- Restore `packages/shared/src/providers/Theme/*` and rewrap providers in `packages/shared/src/providers/index.tsx`.
- Re-add `<InitTheme />` in `apps/site/src/app/(frontend)/layout.tsx` and `apps/cms/src/app/(frontend)/layout.tsx`.
- Re-add the selector in `packages/shared/src/Footer/Component.tsx`.
- Remove the fixed `data-theme="light"` in layouts if you want auto selection.

## Media Folders

Status: disabled in the Media collection (UI-only).

What was disabled
- `folders: false` set on the Media collection.

How to re-enable
- Set `folders: true` in `apps/cms/src/collections/Media.ts`.

## Posts (Blog)

Status: collection and routes removed; DB tables left intact.

What was disabled
- Posts collection removed from `apps/cms/src/payload.config.ts`.
- Frontend posts routes removed in both site and CMS apps.
- Archive/related-post UI blocks and cards removed.
- Redirects plugin no longer registers posts.
- Shared helpers now assume pages only (linking, rich text internal links, redirects, metadata).

How to re-enable
- Restore the Posts collection config in `apps/cms/src/collections/Posts` and add it back to `payload.config.ts`.
- Restore posts routes under `apps/site/src/app/(frontend)/posts` and `apps/cms/src/app/(frontend)/posts`.
- Restore archive/related-post components and wire them back into Pages blocks.
- Re-add posts to redirects plugin collections in `apps/cms/src/plugins/index.ts`.
- Reintroduce posts support in shared helpers (links, rich text, redirects, metadata) and regenerate types/import map.
- Regenerate types and import map after schema changes.

## Categories (Taxonomy)

Status: disabled (collection + nested docs plugin removed; DB tables left intact).

What was disabled
- Categories collection removed from `apps/cms/src/payload.config.ts`.
- Nested docs plugin no longer registers `categories`.
- Seed script no longer creates category documents.

How to re-enable
- Restore `apps/cms/src/collections/Categories.ts` and add it back to `payload.config.ts`.
- Re-enable `nestedDocsPlugin` for `categories` in `apps/cms/src/plugins/index.ts`.
- Re-add category seed data in `apps/cms/src/endpoints/seed/index.ts` if desired.
- Regenerate types after schema changes.

## Admin Dashboard Seed Panel

Status: hidden in admin UI.

What was disabled
- `beforeDashboard` registration removed from `apps/cms/src/payload.config.ts`.

How to re-enable
- Re-add `beforeDashboard: ['@/components/BeforeDashboard']` in `apps/cms/src/payload.config.ts`.
- Regenerate the admin import map.
