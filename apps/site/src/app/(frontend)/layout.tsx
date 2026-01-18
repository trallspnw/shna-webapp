import type { Metadata } from 'next'

import { cn } from '@shna/shared/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@shna/shared/Footer/Component'
import { Header } from '@shna/shared/Header/Component'
import { Providers } from '@shna/shared/providers'
import { InitTheme } from '@shna/shared/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@shna/shared/utilities/mergeOpenGraph'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'

import './globals.css'
import { getSiteURL } from '@shna/shared/utilities/getURL'

type SiteSettingsResponse = {
  allowIndexing?: boolean
}

const getAllowIndexing = async () => {
  const settings = await fetchFromCMS<SiteSettingsResponse>('/api/globals/site-settings')
  return settings?.allowIndexing === true
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const allowIndexing = await getAllowIndexing()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
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
