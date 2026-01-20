'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import {
  DEFAULT_LOCALE,
  type Locale,
  setStoredLocale,
  SUPPORTED_LOCALES,
} from '@shna/shared/utilities/locale'

type Props = {
  locale?: Locale
}

const stripLocalePrefix = (pathname: string, locale: Locale) => {
  if (pathname === `/${locale}`) return '/'
  if (pathname.startsWith(`/${locale}/`)) {
    return pathname.replace(`/${locale}`, '')
  }
  return pathname
}

export const LanguageToggle: React.FC<Props> = ({ locale = DEFAULT_LOCALE }) => {
  const router = useRouter()
  const pathname = usePathname() || '/'

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) return
    setStoredLocale(nextLocale)
    const pathWithoutLocale = stripLocalePrefix(pathname, locale)
    const nextPath =
      pathWithoutLocale === '/' ? `/${nextLocale}` : `/${nextLocale}${pathWithoutLocale}`
    router.push(nextPath)
  }

  return (
    <div className="flex items-center gap-2 text-sm uppercase tracking-wide">
      {SUPPORTED_LOCALES.map((lang, index) => (
        <React.Fragment key={lang}>
          <button
            className={lang === locale ? 'font-semibold' : 'opacity-70 hover:opacity-100'}
            onClick={() => handleSelect(lang)}
            type="button"
          >
            {lang}
          </button>
          {index < SUPPORTED_LOCALES.length - 1 && <span aria-hidden="true">|</span>}
        </React.Fragment>
      ))}
    </div>
  )
}
