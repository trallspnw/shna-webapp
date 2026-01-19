import type { Metadata } from 'next'

import { RelatedPosts } from '@shna/shared/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@shna/shared/components/PayloadRedirects'
import React, { cache } from 'react'
import RichText from '@shna/shared/components/RichText'

import type { Post } from '@shna/shared/payload-types'

import { PostHero } from '@shna/shared/heros/PostHero'
import { generateMeta } from '@shna/shared/utilities/generateMeta'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'
import PageClient from './page.client'

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const posts = await fetchFromCMS<{ docs: Pick<Post, 'slug'>[] }>('/api/posts', {
      depth: 0,
      params: {
        limit: 1000,
        pagination: false,
      },
    })

    const params = posts.docs
      ?.filter((doc) => Boolean(doc.slug))
      .map(({ slug }) => ({ slug })) ?? []

    return params.length > 0 ? params : [{ slug: 'no-posts' }]
  } catch (error) {
    console.warn('Failed to fetch posts for static params; exporting no posts.', error)
    return [{ slug: 'no-posts' }]
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const result = await fetchFromCMS<{ docs: Post[] }>('/api/posts', {
    depth: 2,
    params: {
      'where[slug][equals]': slug,
      limit: 1,
      pagination: false,
    },
  })

  return result.docs?.[0] || null
})
