import { DEFAULT_LANGUAGE, type Language, type LocalizedValue } from '@common/types/language'

function isEmptyValue<T>(value: T | null | undefined): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

/**
 * Resolve a localized value for the requested language, falling back to the default language,
 * and finally to an optional explicit fallback.
 */
export function resolveLocalizedValue<T>(
  localized: LocalizedValue<T> | undefined,
  language: Language,
  fallback?: T,
): T | undefined {
  const current = localized?.[language]
  if (!isEmptyValue(current)) return current ?? undefined

  const defaultValue = localized?.[DEFAULT_LANGUAGE]
  if (!isEmptyValue(defaultValue)) return defaultValue ?? undefined

  return fallback
}

/**
 * Convenience helper for resolving localized text while always returning a string.
 */
export function resolveLocalizedText(
  localized: LocalizedValue<string> | undefined,
  language: Language,
  fallback = '',
): string {
  return resolveLocalizedValue(localized, language, fallback) ?? fallback
}
