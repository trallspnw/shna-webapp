import type React from 'react'
import type { Page } from '@shna/shared/payload-types'

import { getCachedDocument } from '@shna/shared/utilities/getDocument'
import { getCachedRedirects } from '@shna/shared/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
  locale?: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url, locale }) => {
  const redirects = await getCachedRedirects()()

  const localePrefix = locale ? `/${locale}` : ''
  const unprefixedUrl =
    locale && url.startsWith(`${localePrefix}/`) ? url.slice(localePrefix.length) : url

  const redirectItem = redirects.find(
    (redirect) => redirect.from === url || redirect.from === unprefixedUrl,
  )

  if (redirectItem) {
    if (redirectItem.to?.url) {
      const target = redirectItem.to.url
      if (locale && target.startsWith('/') && !target.startsWith(`${localePrefix}/`)) {
        redirect(`${localePrefix}${target === '/' ? '' : target}`)
      }
      redirect(target)
    }

    let redirectUrl: string

    if (typeof redirectItem.to?.reference?.value === 'string') {
      const collection = redirectItem.to?.reference?.relationTo
      const id = redirectItem.to?.reference?.value

      const document = (await getCachedDocument(collection, id, locale)()) as Page
      const slug = document?.slug === 'home' ? '' : `/${document?.slug ?? ''}`
      redirectUrl = `${localePrefix}${slug}`
    } else {
      const slug =
        typeof redirectItem.to?.reference?.value === 'object'
          ? redirectItem.to?.reference?.value?.slug ?? ''
          : ''
      const path = slug === 'home' ? '' : `/${slug}`
      redirectUrl =
        locale && path ? `${localePrefix}${path}` : locale ? localePrefix : path
    }

    if (redirectUrl) redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
