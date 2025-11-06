import type { Event, Page } from '@common/types/payload-types'
import { renderEventPage } from '@common/handlers/event'
import { generateContentMetadata, RouteContext } from '@common/handlers/baseContent'
import { createPayloadRestFetcher } from '@common/fetchers/fetcher'

const eventFetcher = createPayloadRestFetcher<Event>('events')
const fetchers = {
  page: createPayloadRestFetcher<Page>('pages'),
  event: eventFetcher,
}

export default async function EventRoute(context: RouteContext) {
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

export async function generateStaticParams() {
  const events = await eventFetcher.getAll()

  if (!Array.isArray(events) || events.length === 0) {
    console.warn('No events found - skipping static params')
    return [{ slug: '__fake__' }]
  }

  return events.map(event => ({ slug: event.slug }))
}
