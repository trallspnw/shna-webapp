import { PayloadRequest } from 'payload'

const collectionPrefixMap = {
  pages: '',
} as const

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  locale?: string
}

export const generatePreviewPath = ({ collection, slug, locale }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)
  const prefix = locale ? `/${locale}` : ''
  const pathSuffix = slug === 'home' ? '' : `/${encodedSlug}`

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `${prefix}${collectionPrefixMap[collection]}${pathSuffix}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
