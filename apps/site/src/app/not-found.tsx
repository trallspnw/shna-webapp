import type { Event, Page } from '@common/types/payload-types'
import { renderContentPage, generateContentMetadata } from '@common/handlers/baseContent'
import { createSiteFetcher } from '@site/lib/siteFetcher'

const pageFetcher = createSiteFetcher<Page>('pages')
const fetchers = {
  page: pageFetcher,
  event: createSiteFetcher<Event>('events'),
}

export default async function NotFoundPage() {
  return renderContentPage({
    slug: 'not-found',
    fetcher: pageFetcher,
    fetchers,
  })
}

export async function generateMetadata() {
  return generateContentMetadata({
    slug: 'not-found',
    fetcher: pageFetcher,
  })
}
