import { ShareRedirectClient } from './share-redirect.client'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'
import type { Page } from '@shna/shared/payload-types'

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const pages = await fetchFromCMS<{ docs: Pick<Page, 'slug'>[] }>('/api/pages', {
      depth: 0,
      params: {
        limit: 1000,
        pagination: false,
      },
    })

    const params =
      pages.docs
        ?.filter((doc) => Boolean(doc.slug))
        .map(({ slug }) => ({ slug })) ?? []

    return params.length > 0 ? params : [{ slug: 'home' }]
  } catch (error) {
    console.warn('Failed to fetch pages for share params; skipping.', error)
    return [{ slug: 'home' }]
  }
}

type Props = {
  params: Promise<{
    slug?: string
  }>
}

export default async function ShareRedirect({ params }: Props) {
  const { slug } = await params
  return <ShareRedirectClient slug={slug} />
}
