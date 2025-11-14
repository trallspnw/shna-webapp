'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { useLanguage } from '../hooks/useLanguage'
import { resolveLocalizedValue } from '../lib/translation'
import { LocalizedRichText } from '../types/language'

type LocalizedRichTextProps = {
  value: LocalizedRichText
  className?: string
}

/**
 * Render localized Lexical rich text content.
 */
export function LocalizedRichText({ value, className }: LocalizedRichTextProps) {
  const [language] = useLanguage()
  const serialized = resolveLocalizedValue(value, language)

  if (!serialized) return null

  return <RichText className={className} data={serialized} />
}
