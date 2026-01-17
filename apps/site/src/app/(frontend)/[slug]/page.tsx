import type { Metadata } from 'next'

import { PayloadRedirects } from '@shna/shared/components/PayloadRedirects'
import React, { cache } from 'react'

import { RenderBlocks } from '@shna/shared/blocks/RenderBlocks'
import { RenderHero } from '@shna/shared/heros/RenderHero'
import { generateMeta } from '@shna/shared/utilities/generateMeta'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'
import type { Page } from '@shna/shared/payload-types'
import PageClient from './page.client'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const pages = await fetchFromCMS<{ docs: Pick<Page, 'slug'>[] }>('/api/pages', {
    depth: 0,
    params: {
      limit: 1000,
      pagination: false,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const result = await fetchFromCMS<{ docs: Page[] }>('/api/pages', {
    depth: 2,
    params: {
      'where[slug][equals]': slug,
      limit: 1,
      pagination: false,
    },
  })

  return result.docs?.[0] || null
})
