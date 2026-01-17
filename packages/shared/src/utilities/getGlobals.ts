import type { Config } from '@shna/shared/payload-types'
import { unstable_cache } from 'next/cache'
import { fetchFromCMS } from './payloadAPI'

type Global = keyof Config['globals']

async function getGlobal(
  slug: Global,
  depth = 0,
  draft = false,
  headers?: HeadersInit,
) {
  return fetchFromCMS<Config['globals'][Global]>(`/api/globals/${slug}`, {
    depth,
    draft,
    headers,
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
) => {
  if (draft) {
    return async () => getGlobal(slug, depth, true, headers)
  }

  return unstable_cache(async () => getGlobal(slug, depth, false, headers), [slug, depth], {
    tags: [`global_${slug}`],
  })
}
