import type { Config } from '@shna/shared/payload-types'
import { unstable_cache } from 'next/cache'
import { fetchFromCMS } from './payloadAPI'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0, locale?: string) {
  const result = await fetchFromCMS<{ docs: Config['collections'][Collection][] }>(
    `/api/${collection}`,
    {
      depth,
      locale,
      params: {
        'where[slug][equals]': slug,
        limit: 1,
        pagination: false,
      },
    },
  )

  return result.docs?.[0]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: Collection, slug: string, locale?: string) =>
  unstable_cache(async () => getDocument(collection, slug, 0, locale), [collection, slug, locale ?? ''], {
    tags: [`${collection}_${slug}`],
  })
