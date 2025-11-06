import type { Event, Page } from '@common/types/payload-types'
import { renderContentPage, generateContentMetadata } from '@common/handlers/baseContent'
import { createPayloadRestFetcher } from '@common/fetchers/fetcher'

const pageFetcher = createPayloadRestFetcher<Page>('pages')
const fetchers = {
  page: pageFetcher,
  event: createPayloadRestFetcher<Event>('events'),
}

// Prevents missing secret key errors
export const dynamic = 'force-dynamic'

export default async function CmsNotFoundPage() {
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
