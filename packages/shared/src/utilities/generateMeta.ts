import type { Metadata } from 'next'

import type { Media, Page, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL, getSiteURL } from './getURL'
import type { Locale } from './locale'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (!image || typeof image !== 'object' || !('url' in image)) {
    return undefined
  }

  const serverUrl = getServerSideURL()
  const ogUrl = image.sizes?.og?.url

  return ogUrl ? serverUrl + ogUrl : serverUrl + image.url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | null
  locale?: Locale
  allowIndexing?: boolean
}): Promise<Metadata> => {
  const { doc, locale, allowIndexing } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const siteTitle = 'Seminary Hill Natural Area'
  const description = doc?.meta?.description
  const title = doc?.meta?.title ? `${doc?.meta?.title} | ${siteTitle}` : siteTitle

  const siteURL = getSiteURL()
  const prefix = locale ? `/${locale}` : ''
  const slug = Array.isArray(doc?.slug) ? doc?.slug.join('/') : doc?.slug
  const path = slug && slug !== 'home' ? `/${slug}` : ''
  const url = `${siteURL}${prefix}${path}`
  const robots =
    allowIndexing === false
      ? { index: false, follow: false }
      : doc?.meta?.noIndex === true
        ? { index: false, follow: true }
        : undefined

  return {
    description,
    openGraph: mergeOpenGraph({
      ...(description ? { description } : {}),
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
              },
            ],
          }
        : {}),
      siteName: siteTitle,
      title,
      type: 'website',
      url,
    }),
    robots,
    title,
  }
}
