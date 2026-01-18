import type { Metadata } from 'next/types'

import { CollectionArchive } from '@shna/shared/components/CollectionArchive'
import type { CardPostData } from '@shna/shared/components/Card'
import { PageRange } from '@shna/shared/components/PageRange'
import { Pagination } from '@shna/shared/components/Pagination'
import configPromise from '@payload-config'
import { getPayload, type PaginatedDocs } from 'payload'
import React from 'react'
import PageClient from './page.client'
import type { Post } from '@shna/shared/payload-types'

export const revalidate = 600

export default async function Page() {
  const hasPayloadEnv = Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URL)
  const posts = hasPayloadEnv
    ? ((await (async () => {
        const payload = await getPayload({ config: configPromise })
        return payload.find({
          collection: 'posts',
          depth: 1,
          limit: 12,
          overrideAccess: false,
          select: {
            title: true,
            slug: true,
            categories: true,
            meta: true,
          },
        })
      })()) as unknown as PaginatedDocs<Post>)
    : ({
        docs: [],
        page: 1,
        totalDocs: 0,
        totalPages: 0,
      } as unknown as PaginatedDocs<Post>)

  const cardPosts: CardPostData[] = posts.docs.map((doc) => ({
    title: doc.title,
    slug: doc.slug,
    categories: doc.categories,
    meta: doc.meta,
  }))

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={cardPosts} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
