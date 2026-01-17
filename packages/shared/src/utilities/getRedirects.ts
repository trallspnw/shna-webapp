import { unstable_cache } from 'next/cache'
import type { Redirect } from '@shna/shared/payload-types'
import { fetchFromCMS } from './payloadAPI'

export async function getRedirects(depth = 1) {
  const result = await fetchFromCMS<{ docs: Redirect[] }>('/api/redirects', {
    depth,
    params: {
      limit: 1000,
      pagination: false,
    },
  })

  return result.docs
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ['redirects'], {
    tags: ['redirects'],
  })
