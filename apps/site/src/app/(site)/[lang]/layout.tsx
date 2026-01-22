import type { Metadata } from 'next'

import React from 'react'

import { SiteShell } from '../SiteShell'
import { mergeOpenGraph } from '@shna/shared/utilities/mergeOpenGraph'

import '../globals.css'
import { getSiteURL } from '@shna/shared/utilities/getURL'
import { getLocaleFromParam } from '@shna/shared/utilities/locale'

export const dynamicParams = false

export async function generateStaticParams() {
  return ['en', 'es'].map((lang) => ({ lang }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params
  const locale = getLocaleFromParam(lang)

  return <SiteShell locale={locale}>{children}</SiteShell>
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
