import type { Metadata } from 'next/types'

import React from 'react'
import { Search } from '@shna/shared/search/Component'
import PageClient from './page.client'
import SearchResults from './search-results.client'

export const dynamic = 'force-static'

export default async function Page() {
  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      <SearchResults />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Search`,
  }
}
