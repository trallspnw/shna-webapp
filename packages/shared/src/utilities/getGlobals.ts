import type { Config } from '@shna/shared/payload-types'
import { unstable_cache } from 'next/cache'
import { fetchFromCMS } from './payloadAPI'

type Global = keyof Config['globals']

async function getGlobal(
  slug: Global,
  depth = 0,
  draft = false,
  headers?: HeadersInit,
  locale?: string,
) {
  return fetchFromCMS<Config['globals'][Global]>(`/api/globals/${slug}`, {
    depth,
    draft,
    headers,
    locale,
    // Use no-store here — unstable_cache handles caching at a higher level.
    // force-cache inside a dynamic route (one that called headers()) causes
    // Next.js 15 to throw in certain contexts.
    cache: 'no-store',
  })
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (
  slug: Global,
  depth = 0,
  draft = false,
  headers?: HeadersInit,
  locale?: string,
) => {
  if (draft) {
    return async () => getGlobal(slug, depth, true, headers, locale)
  }

  // Don't forward request headers in the public (non-draft) path — passing browser
  // headers (e.g. Cache-Control: no-cache from a hard refresh) into the fetch causes
  // Next.js to bypass its Data Cache and make a live network call every time.
  return unstable_cache(
    async () => getGlobal(slug, depth, false, undefined, locale),
    [slug, String(depth), String(locale ?? '')],
    {
      tags: [`global_${slug}`],
    },
  )
}
