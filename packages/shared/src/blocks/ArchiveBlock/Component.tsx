import type { Post, ArchiveBlock as ArchiveBlockProps } from '@shna/shared/payload-types'
import React from 'react'
import RichText from '@shna/shared/components/RichText'

import { CollectionArchive } from '@shna/shared/components/CollectionArchive'
import { fetchFromCMS } from '@shna/shared/utilities/payloadAPI'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })
    const params: Record<string, string | number | boolean | undefined> = {
      limit,
      pagination: false,
    }

    if (flattenedCategories && flattenedCategories.length > 0) {
      params['where[categories][in]'] = flattenedCategories.join(',')
    }

    const fetchedPosts = await fetchFromCMS<{ docs: Post[] }>('/api/posts', {
      depth: 1,
      params,
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
