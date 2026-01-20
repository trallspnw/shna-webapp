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

import '../globals.css'
import { getSiteURL } from '@shna/shared/utilities/getURL'
import { getLocaleFromParam } from '@shna/shared/utilities/locale'

type SiteSettings = Config['globals']['site-settings']

export const dynamicParams = false

export async function generateStaticParams() {
  return ['en', 'es'].map((lang) => ({ lang }))
}

const resolveFaviconUrl = (media?: Media | number | null): string | null => {
  if (!media || typeof media !== 'object') return null
  const prefix = 'prefix' in media ? (media as { prefix?: string | null }).prefix : undefined
  const fromPrefix = getMediaUrlFromPrefix(prefix, media.filename, media.updatedAt)
  return fromPrefix || getMediaUrl(media.url, media.updatedAt) || null
}

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params
  const locale = getLocaleFromParam(lang)
  const siteSettings = (await getCachedGlobal('site-settings', 1, false, undefined, locale)()) as SiteSettings
  const allowIndexing = siteSettings?.allowIndexing === true
  const faviconSvgUrl = resolveFaviconUrl(siteSettings?.faviconSvg)
  const faviconIcoUrl = resolveFaviconUrl(siteSettings?.faviconIco)

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={locale}
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
          <Header locale={locale} />
          {children}
          <Footer locale={locale} />
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
