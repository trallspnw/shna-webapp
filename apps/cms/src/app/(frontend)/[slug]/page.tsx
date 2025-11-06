import type { Event, Page } from '@common/types/payload-types'
import { renderContentPage, generateContentMetadata, RouteContext } from '@common/handlers/baseContent'
import { createPayloadRestFetcher } from '@common/fetchers/fetcher'

const pageFetcher = createPayloadRestFetcher<Page>('pages')
const fetchers = {
  page: pageFetcher,
  event: createPayloadRestFetcher<Event>('events'),
}

export default async function CmsPage(context: RouteContext) {
  const { slug } = await context.params

  return renderContentPage({
    slug,
    fetcher: pageFetcher,
    fetchers,
  })
}

export async function generateMetadata(context: RouteContext) {
  const { slug } = await context.params

  return generateContentMetadata({
    slug,
    fetcher: pageFetcher,
  })
}
