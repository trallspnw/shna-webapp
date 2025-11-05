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
