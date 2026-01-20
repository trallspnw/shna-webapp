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

  return unstable_cache(
    async () => getGlobal(slug, depth, false, headers, locale),
    [slug, String(depth), String(locale ?? '')],
    {
      tags: [`global_${slug}`],
    },
  )
}
