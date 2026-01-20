import type { Metadata } from 'next'

import { cn } from '@shna/shared/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@shna/shared/Footer/Component'
import { Header } from '@shna/shared/Header/Component'
import { Providers } from '@shna/shared/providers'
import type { Config, Media } from '@shna/shared/payload-types'
import { mergeOpenGraph } from '@shna/shared/utilities/mergeOpenGraph'
import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import { getMediaUrl, getMediaUrlFromPrefix } from '@shna/shared/utilities/getMediaUrl'

import './globals.css'
import { getSiteURL } from '@shna/shared/utilities/getURL'

type SiteSettings = Config['globals']['site-settings']

const getSiteSettings = getCachedGlobal('site-settings', 1)

const resolveFaviconUrl = (media?: Media | number | null): string | null => {
  if (!media || typeof media !== 'object') return null
  const fromPrefix = getMediaUrlFromPrefix(media.prefix, media.filename, media.updatedAt)
  return fromPrefix || getMediaUrl(media.url, media.updatedAt) || null
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = (await getSiteSettings()) as SiteSettings
  const allowIndexing = siteSettings?.allowIndexing === true
  const faviconSvgUrl = resolveFaviconUrl(siteSettings?.faviconSvg)
  const faviconIcoUrl = resolveFaviconUrl(siteSettings?.faviconIco)

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang="en"
      suppressHydrationWarning
      data-theme="light"
    >
      <head>
        {faviconIcoUrl && <link href={faviconIcoUrl} rel="icon" sizes="32x32" />}
        {faviconSvgUrl && <link href={faviconSvgUrl} rel="icon" type="image/svg+xml" />}
        {!allowIndexing && <meta content="noindex, nofollow" name="robots" />}
      </head>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
