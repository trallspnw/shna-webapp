import canUseDOM from './canUseDOM'
import {
  getStoredLocale as getStoredLocaleRaw,
  LOCALE_STORAGE_KEY,
  setStoredLocale as setStoredLocaleRaw,
} from '../client/storage'

export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const isSupportedLocale = (value?: string | null): value is Locale => {
  if (!value) return false
  return SUPPORTED_LOCALES.includes(value as Locale)
}

export const normalizeLocale = (value?: string | null): Locale | null => {
  if (!value) return null
  const base = value.toLowerCase().split('-')[0]
  return isSupportedLocale(base) ? base : null
}

export { LOCALE_STORAGE_KEY }

export const getStoredLocale = (): Locale | null => {
  if (!canUseDOM) return null
  return normalizeLocale(getStoredLocaleRaw() ?? null)
}

export const setStoredLocale = (locale: Locale) => {
  if (!canUseDOM) return
  setStoredLocaleRaw(locale)
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
