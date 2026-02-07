import type { Metadata } from 'next'

import { PayloadRedirects } from '@shna/shared/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type PaginatedDocs, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode, headers } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@shna/shared/blocks/RenderBlocks'
import { RenderHero } from '@shna/shared/heros/RenderHero'
import { generateMeta } from '@shna/shared/utilities/generateMeta'
import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import type { Config, Page } from '@shna/shared/payload-types'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getLocaleFromParam, type Locale } from '@shna/shared/utilities/locale'

export async function generateStaticParams() {
  if (!process.env.PAYLOAD_SECRET || !process.env.DATABASE_URL) {
    return []
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = pages.docs
      ?.filter((doc) => doc.slug !== 'home')
      .flatMap(({ slug }) => ['en', 'es'].map((lang) => ({ lang, slug })))

    return params && params.length > 0
      ? params
      : ['en', 'es'].map((lang) => ({ lang, slug: 'home' }))
  } catch (error) {
    console.warn('Failed to fetch pages for static params; skipping.', error)
    return []
  }
}

type Args = {
  params: Promise<{
    lang: string
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { lang, slug = 'home' } = await paramsPromise
  const locale = getLocaleFromParam(lang)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = decodedSlug === 'home' ? `/${locale}` : `/${locale}/${decodedSlug}`
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
    locale,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects locale={locale} url={url} />
  }

  const { hero, layout, contentMode, html } = page
  const resolvedMode = contentMode ?? 'builder'

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound locale={locale} url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero locale={locale} {...hero} />
      {resolvedMode === 'html' ? (
        <div className="container mt-16" dangerouslySetInnerHTML={{ __html: html ?? '' }} />
      ) : (
        <RenderBlocks blocks={layout ?? []} locale={locale} />
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { lang, slug = 'home' } = await paramsPromise
  const locale = getLocaleFromParam(lang)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
    locale,
  })

  const { isEnabled: draft } = await draftMode()
  const requestHeaders = await headers()
  const siteSettings = (await getCachedGlobal(
    'site-settings',
    1,
    draft,
    requestHeaders,
    locale,
  )()) as Config['globals']['site-settings']

  return generateMeta({
    doc: page as unknown as Page,
    locale,
    allowIndexing: siteSettings?.allowIndexing === true,
  })
}

const queryPageBySlug = cache(
  async ({
    slug,
    locale,
  }: {
    slug: string
    locale: Locale
  }): Promise<RequiredDataFromCollectionSlug<'pages'> | null> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = (await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    depth: 5,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })) as unknown as PaginatedDocs<RequiredDataFromCollectionSlug<'pages'>>

  return result.docs?.[0] ?? null
  },
)
