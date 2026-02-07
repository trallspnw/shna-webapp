import { cn } from '@shna/shared/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@shna/shared/Footer/Component'
import { Header } from '@shna/shared/Header/Component'
import { Providers } from '@shna/shared/providers'
import { RefCapture } from '@shna/shared/components/attribution/RefCapture'
import { LocaleInit } from '@shna/shared/components/locale/LocaleInit'
import type { Config, Media } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { draftMode, headers } from 'next/headers'
import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import { getMediaUrl, getMediaUrlFromPrefix } from '@shna/shared/utilities/getMediaUrl'

import './globals.css'

type SiteSettings = Config['globals']['site-settings']

type Props = {
  children: React.ReactNode
  locale: Locale
  localeInitMode?: 'force' | 'ifMissing' | 'off'
}

const resolveFaviconUrl = (media?: Media | number | null): string | null => {
  if (!media || typeof media !== 'object') return null
  const prefix = 'prefix' in media ? (media as { prefix?: string | null }).prefix : undefined
  const fromPrefix = getMediaUrlFromPrefix(prefix, media.filename, media.updatedAt)
  return fromPrefix || getMediaUrl(media.url, media.updatedAt) || null
}

export async function FrontEndShell({ children, locale, localeInitMode = 'force' }: Props) {
  const { isEnabled } = await draftMode()
  const requestHeaders = await headers()
  const hasCMSURL = Boolean(
    process.env.NEXT_PUBLIC_CMS_URL ||
      process.env.CMS_PUBLIC_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
  )

  const siteSettings = (await getCachedGlobal(
    'site-settings',
    1,
    isEnabled,
    requestHeaders,
    locale,
  )()) as SiteSettings
  const faviconSvgUrl = resolveFaviconUrl(siteSettings?.faviconSvg)
  const faviconIcoUrl = resolveFaviconUrl(siteSettings?.faviconIco)
  const minPageWidth = siteSettings?.minPageWidth ?? 360
  const maxPageWidth = siteSettings?.maxPageWidth ?? 1440
  const contentMaxWidth = siteSettings?.contentMaxWidth ?? 1040

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
      </head>
      <body
        style={{
          ['--minPageWidth' as string]: `${minPageWidth}px`,
          ['--maxPageWidth' as string]: `${maxPageWidth}px`,
          ['--contentMaxWidth' as string]: `${contentMaxWidth}px`,
        }}
      >
        <Providers>
          <RefCapture />
          {localeInitMode !== 'off' && <LocaleInit locale={locale} mode={localeInitMode} />}
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          {hasCMSURL && (
            <div className="bg-header text-header-foreground">
              <div className="mx-auto w-full max-w-[var(--maxPageWidth)]">
                <Header draft={isEnabled} headers={requestHeaders} locale={locale} />
              </div>
            </div>
          )}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[var(--maxPageWidth)]">{children}</div>
          </main>
          {hasCMSURL && (
            <div className="bg-header text-header-foreground">
              <div className="mx-auto w-full max-w-[var(--maxPageWidth)]">
                <Footer draft={isEnabled} headers={requestHeaders} locale={locale} />
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  )
}
