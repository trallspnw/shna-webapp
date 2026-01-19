import type { Metadata } from 'next/types'

import { CollectionArchive } from '@shna/shared/components/CollectionArchive'
import { PageRange } from '@shna/shared/components/PageRange'
import { Pagination } from '@shna/shared/components/Pagination'
import React from 'react'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'
import type { Post } from '@shna/shared/payload-types'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'
export const dynamicParams = false

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await fetchFromCMS<{
    docs: Post[]
    page: number
    totalDocs: number
    totalPages: number
  }>('/api/posts', {
    depth: 1,
    params: {
      limit: 12,
      page: sanitizedPageNumber,
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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  try {
    const { totalDocs } = await fetchFromCMS<{ totalDocs: number }>('/api/posts', {
      params: {
        limit: 1,
      },
    })

    const totalPages = Math.ceil((totalDocs ?? 0) / 12)

    const pages: { pageNumber: string }[] = []

    for (let i = 1; i <= totalPages; i++) {
      pages.push({ pageNumber: String(i) })
    }

    return pages.length > 0 ? pages : [{ pageNumber: '1' }]
  } catch (error) {
    console.warn('Failed to fetch post counts for pagination; exporting no pages.', error)
    return [{ pageNumber: '1' }]
  }
}
