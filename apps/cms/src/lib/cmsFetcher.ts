import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { mapPagesToNavItems, type ContentFetcher, type FetchOptions } from '@common/fetchers/fetcher'
import type { Page } from '@common/types/payload-types'

export function createCmsFetcher<T>(collection: string): ContentFetcher<T> {
  return {
    get: async (slug: string) => {
      const payload = await loadPayload()
      const result = await payload.find({
        collection,
        where: { slug: { equals: slug } },
        limit: 1,
      })

      return (result.docs[0] as T) ?? null
    },
    getAll: (options: FetchOptions = {}) => getAllOfType<T>(collection, options),
    getNavItems: async () => {
      const pages = await getAllOfType<Page>('pages')
      return mapPagesToNavItems(pages)
    },
    getGlobalData: async <U>(slug: string): Promise<U> => {
      const payload = await loadPayload()
      return await payload.findGlobal({ slug }) as U
    },
  }
}

async function loadPayload() {
  return getPayload({ config: configPromise })
}

async function getAllOfType<U>(collection: string, options: FetchOptions = {}): Promise<U[]> {
  const payload = await loadPayload()
  const { limit = 100, sortOptions } = options

  const sort = sortOptions
    ? `${sortOptions.sortOrder === 'desc' ? '-' : ''}${sortOptions.sortBy}`
    : undefined

  const result = await payload.find({
    collection,
    limit,
    ...(sort && { sort }),
  })

  return result.docs as U[]
}
