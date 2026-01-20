'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { getPreferredLocale, setStoredLocale } from '@shna/shared/utilities/locale'

type Props = {
  slug?: string
}

export function ShareRedirectClient({ slug }: Props) {
  const router = useRouter()

  useEffect(() => {
    const locale = getPreferredLocale()
    setStoredLocale(locale)
    const path = slug && slug !== 'home' ? `/${locale}/${slug}` : `/${locale}`
    router.replace(path)
  }, [router, slug])

  return <p>Redirecting...</p>
}
