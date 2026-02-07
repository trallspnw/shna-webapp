'use client'
import { useHeaderTheme } from '@shna/shared/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  locale?: Locale
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="container relative z-40" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-start">
        <HeaderNav data={data} locale={locale} />
      </div>
    </header>
  )
}
