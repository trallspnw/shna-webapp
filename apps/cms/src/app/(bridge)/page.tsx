"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { getPreferredLocale, setStoredLocale } from '@shna/shared/utilities/locale'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    const locale = getPreferredLocale()
    setStoredLocale(locale)
    router.replace(`/${locale}`)
  }, [router])

  return <p>Redirecting...</p>
}
