import type { Metadata } from 'next/types'

import { CollectionArchive } from '@shna/shared/components/CollectionArchive'
import { PageRange } from '@shna/shared/components/PageRange'
import { Pagination } from '@shna/shared/components/Pagination'
import React from 'react'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'
import type { Post } from '@shna/shared/payload-types'
import PageClient from './page.client'

export const dynamic = 'force-static'

export default async function Page() {
  const posts = await fetchFromCMS<{
    docs: Post[]
    page: number
    totalDocs: number
    totalPages: number
  }>('/api/posts', {
    depth: 1,
    params: {
      limit: 12,
    },
  })

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

      <CollectionArchive posts={posts.docs} />

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
