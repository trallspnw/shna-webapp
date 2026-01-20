import type { Metadata } from 'next'

import { PayloadRedirects } from '@shna/shared/components/PayloadRedirects'
import React, { cache } from 'react'

import { RenderBlocks } from '@shna/shared/blocks/RenderBlocks'
import { RenderHero } from '@shna/shared/heros/RenderHero'
import { generateMeta } from '@shna/shared/utilities/generateMeta'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'
import type { Page } from '@shna/shared/payload-types'
import PageClient from './page.client'
import { getLocaleFromParam } from '@shna/shared/utilities/locale'

export const dynamic = 'force-static'
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

    const slugs =
      pages.docs
        ?.filter((doc) => Boolean(doc.slug) && doc.slug !== 'home')
        .map(({ slug }) => ({ slug })) ?? []

    const params = ['en', 'es'].flatMap((lang) => slugs.map(({ slug }) => ({ lang, slug })))

    return params.length > 0 ? params : ['en', 'es'].map((lang) => ({ lang, slug: 'home' }))
  } catch (error) {
    console.warn('Failed to fetch pages for static params; exporting home only.', error)
    return ['en', 'es'].map((lang) => ({ lang, slug: 'home' }))
  }
}

type Args = {
  params: Promise<{
    lang: string
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { lang, slug = 'home' } = await paramsPromise
  const locale = getLocaleFromParam(lang)
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = decodedSlug === 'home' ? `/${locale}` : `/${locale}/${decodedSlug}`
  const page = await queryPageBySlug({
    slug: decodedSlug,
    locale,
  })

  if (!page) {
    return <PayloadRedirects locale={locale} url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound locale={locale} url={url} />

      <RenderHero locale={locale} {...hero} />
      <RenderBlocks blocks={layout} locale={locale} />
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

  return generateMeta({ doc: page, locale })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: string }) => {
  const result = await fetchFromCMS<{ docs: Page[] }>('/api/pages', {
    depth: 2,
    locale,
    params: {
      'where[slug][equals]': slug,
      limit: 1,
      pagination: false,
    },
  })

  return result.docs?.[0] || null
})
