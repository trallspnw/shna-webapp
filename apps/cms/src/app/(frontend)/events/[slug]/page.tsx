import type { Event, Page } from '@common/types/payload-types'
import { renderEventPage } from '@common/handlers/event'
import { generateContentMetadata, RouteContext } from '@common/handlers/baseContent'
import { createPayloadRestFetcher } from '@common/fetchers/fetcher'

const eventFetcher = createPayloadRestFetcher<Event>('events')
const fetchers = {
  page: createPayloadRestFetcher<Page>('pages'),
  event: eventFetcher,
}

export default async function CmsEvent(context: RouteContext) {
  const { slug } = await context.params

  return renderEventPage({
    slug,
    fetcher: eventFetcher,
    fetchers,
  })
}

export async function generateMetadata(context: RouteContext) {
  const { slug } = await context.params

  return generateContentMetadata({
    slug,
    fetcher: eventFetcher,
  })
}
