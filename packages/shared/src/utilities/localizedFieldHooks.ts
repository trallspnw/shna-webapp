import type { FieldHook } from 'payload'

import { DEFAULT_LOCALE } from './locale'

const isDefaultLocale = (locale?: string | null) => {
  return (locale ?? DEFAULT_LOCALE) === DEFAULT_LOCALE
}

const hasTextContent = (node: unknown): boolean => {
  if (!node || typeof node !== 'object') return false
  const record = node as { text?: string; children?: unknown[] }
  if (typeof record.text === 'string' && record.text.trim().length > 0) return true
  if (Array.isArray(record.children)) {
    return record.children.some((child) => hasTextContent(child))
  }
  return false
}

export const isRichTextEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (typeof value !== 'object') return false

  const root = (value as { root?: unknown }).root
  if (!root) return false

  return !hasTextContent(root)
}

export const clearEmptyLocalizedText: FieldHook = ({ value, req }) => {
  if (isDefaultLocale(req?.locale)) return value
  if (typeof value === 'string' && value.trim().length === 0) return null
  return value
}

export const clearEmptyLocalizedRichText: FieldHook = ({ value, req }) => {
  if (isDefaultLocale(req?.locale)) return value
  if (isRichTextEmpty(value)) return null
  return value
}

type ValidateArgs = {
  req?: {
    locale?: string | null
  }
}

export const requireDefaultLocale = (value: unknown, { req }: ValidateArgs): true | string => {
  if (!isDefaultLocale(req?.locale)) return true
  return value ? true : 'Required in English'
}
