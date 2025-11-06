import { NavItem } from '@common/types/nav'
import { Page } from '@common/types/payload-types'

export type FetcherTypes = 'page' | 'event'

export type Fetchers = Record<FetcherTypes, ContentFetcher<unknown>>

export interface FetchOptions {
  limit?: number
  sortOptions?: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

export interface ContentFetcher<T> {
  get(slug: string): Promise<T | null>
  getAll(options?: FetchOptions): Promise<T[]>
  getNavItems(): Promise<NavItem[]>
  getGlobalData<U>(slug: string): Promise<U>
}

export function mapPagesToNavItems(pages: Page[]): NavItem[] {
  return pages
    .filter(page => page.showInNav)
    .sort((a, b) => {
      return (a.navigationOptions?.navOrder ?? Infinity) - (b.navigationOptions?.navOrder ?? Infinity)
    })
    .map(page => ({
      href: `/${page.slug}`,
      label: page.navigationOptions!.navLabel,
    }))
}

/**
 * Creates a fetcher that reads from Payload's REST API. Works for both the site
 * and CMS front-ends where only published data is required.
 */
export function createPayloadRestFetcher<T>(collection: string, options: { baseUrl?: string } = {}): ContentFetcher<T> {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.BASE_URL)

  if (!baseUrl) {
    throw new Error('createPayloadRestFetcher: BASE_URL is not defined')
  }

  return {
    get: async (slug: string) => {
      const url = `${baseUrl}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}`
      const result = await fetch(url)
      const data = await result.json()
      return (data.docs[0] as T) ?? null
    },
    getAll: (fetchOptions: FetchOptions = {}) => getAllOfType<T>({ baseUrl, collection, fetchOptions }),
    getNavItems: async () => {
      const pages = await getAllOfType<Page>({ baseUrl, collection: 'pages' })
      return mapPagesToNavItems(pages)
    },
    getGlobalData: async <U>(slug: string): Promise<U> => {
      const result = await fetch(`${baseUrl}/api/globals/${slug}`)
      const data = await result.json()
      return data as U
    },
  }
}

function normalizeBaseUrl(value?: string | null) {
  return value ? value.replace(/\/$/, '') : undefined
}

async function getAllOfType<U>({
  baseUrl,
  collection,
  fetchOptions = {},
}: {
  baseUrl: string
  collection: string
  fetchOptions?: FetchOptions
}): Promise<U[]> {
  const url = new URL(`${baseUrl}/api/${collection}`)
  url.searchParams.set('limit', String(fetchOptions.limit ?? 100))

  if (fetchOptions.sortOptions) {
    const { sortBy, sortOrder } = fetchOptions.sortOptions
    url.searchParams.set('sort', `${sortOrder === 'desc' ? '-' : ''}${sortBy}`)
  }

  const res = await fetch(url.toString())
  const data = await res.json()
  return data.docs as U[]
}
