import type { Event, Page } from '@common/types/payload-types'
import { renderEventPage } from '@common/handlers/event'
import { generateContentMetadata, RouteContext } from '@common/handlers/baseContent'
import { createSiteFetcher } from '@site/lib/siteFetcher'

const eventFetcher = createSiteFetcher<Event>('events')
const fetchers = {
  page: createSiteFetcher<Page>('pages'),
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
