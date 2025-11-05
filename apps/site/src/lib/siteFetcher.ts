import { mapPagesToNavItems, type ContentFetcher, type FetchOptions } from '@common/fetchers/fetcher'
import type { NavItem } from '@common/types/nav'
import type { Page } from '@common/types/payload-types'

export function createSiteFetcher<T>(collection: string): ContentFetcher<T> {
  return {
    get: async (slug: string) => {
      const result = await fetch(`${process.env.BASE_URL}/api/${collection}?where[slug][equals]=${slug}`)
      const data = await result.json()
      return (data.docs[0] as T) ?? null
    },
    getAll: (options: FetchOptions = {}) => getAllOfType<T>(collection, options),
    getNavItems: async (): Promise<NavItem[]> => {
      const pages = await getAllOfType<Page>('pages')
      return mapPagesToNavItems(pages)
    },
    getGlobalData: async <U>(slug: string): Promise<U> => {
      const result = await fetch(`${process.env.BASE_URL}/api/globals/${slug}`)
      const data = await result.json()
      return data as U
    },
  }
}

async function getAllOfType<U>(collection: string, options: FetchOptions = {}): Promise<U[]> {
  const url = new URL(`${process.env.BASE_URL}/api/${collection}`)
  url.searchParams.set('limit', String(options.limit ?? 100))

  if (options.sortOptions) {
    const { sortBy, sortOrder } = options.sortOptions
    url.searchParams.set('sort', `${sortOrder === 'desc' ? '-' : ''}${sortBy}`)
  }

  const res = await fetch(url.toString())
  const data = await res.json()
  return data.docs as U[]
}
