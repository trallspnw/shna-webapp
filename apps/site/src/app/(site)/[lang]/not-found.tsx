'use client'

import Link from 'next/link'
import React from 'react'
import { useParams } from 'next/navigation'

import { Button } from '@shna/shared/components/ui/button'
import { getLocaleFromParam } from '@shna/shared/utilities/locale'

export default function NotFound() {
  const params = useParams()
  const locale = getLocaleFromParam(params?.lang as string | undefined)

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <Button asChild variant="default">
        <Link href={`/${locale}`}>Go home</Link>
      </Button>
    </div>
  )
}
