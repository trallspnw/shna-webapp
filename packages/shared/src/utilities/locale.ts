import canUseDOM from './canUseDOM'

export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'shna-locale'

export const isSupportedLocale = (value?: string | null): value is Locale => {
  if (!value) return false
  return SUPPORTED_LOCALES.includes(value as Locale)
}

export const normalizeLocale = (value?: string | null): Locale | null => {
  if (!value) return null
  const base = value.toLowerCase().split('-')[0]
  return isSupportedLocale(base) ? base : null
}

export const getStoredLocale = (): Locale | null => {
  if (!canUseDOM) return null
  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
}

export const setStoredLocale = (locale: Locale) => {
  if (!canUseDOM) return
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export const getPreferredLocale = (): Locale => {
  const stored = getStoredLocale()
  if (stored) return stored

  if (canUseDOM) {
    for (const language of window.navigator.languages ?? []) {
      const normalized = normalizeLocale(language)
      if (normalized) return normalized
    }
  }

  return DEFAULT_LOCALE
}

export const getLocaleFromParam = (value?: string | null): Locale => {
  return normalizeLocale(value) ?? DEFAULT_LOCALE
}
