'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CollectionArchive } from '@shna/shared/components/CollectionArchive'
import type { CardPostData } from '@shna/shared/components/Card'
import { getCMSURL } from '@shna/shared/utilities/getURL'

const buildSearchURL = (query: string) => {
  const url = new URL('/api/search', getCMSURL())

  if (!query) {
    url.searchParams.set('limit', '0')
    return url
  }

  url.searchParams.set('depth', '1')
  url.searchParams.set('limit', '12')
  url.searchParams.set('pagination', 'false')
  url.searchParams.set('where[or][0][title][like]', query)
  url.searchParams.set('where[or][1][meta.description][like]', query)
  url.searchParams.set('where[or][2][meta.title][like]', query)
  url.searchParams.set('where[or][3][slug][like]', query)

  return url
}

const SearchResults: React.FC = () => {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<CardPostData[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const queryValue = useMemo(() => {
    const raw = searchParams.get('q')
    return raw ? raw.trim() : ''
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const fetchResults = async () => {
      if (!queryValue) {
        setPosts([])
        return
      }

      try {
        setError(null)
        const response = await fetch(buildSearchURL(queryValue))
        if (!response.ok) {
          throw new Error(`Search failed (${response.status})`)
        }

        const data: { docs: CardPostData[] } = await response.json()
        if (!cancelled) {
          setPosts(data.docs || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Search failed')
          setPosts([])
        }
      }
    }

    fetchResults()

    return () => {
      cancelled = true
    }
  }, [queryValue])

  if (!queryValue) {
    return <div className="container">Enter a search term to see results.</div>
  }

  if (error) {
    return <div className="container">{error}</div>
  }

  if (!posts) {
    return <div className="container">Searching...</div>
  }

  return posts.length > 0 ? (
    <CollectionArchive posts={posts} />
  ) : (
    <div className="container">No results found.</div>
  )
}

export default SearchResults
