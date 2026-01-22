'use client'

import { useEffect } from 'react'

import { ensureStoredLocale, getStoredLocale } from '@shna/shared/client/storage'

type Props = {
  locale: string
  mode?: 'force' | 'ifMissing'
}

export const LocaleInit = ({ locale, mode = 'force' }: Props): null => {
  useEffect(() => {
    if (mode === 'ifMissing' && getStoredLocale()) return
    ensureStoredLocale(locale)
  }, [locale, mode])

  return null
}
