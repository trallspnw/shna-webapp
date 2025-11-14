import type { SerializedEditorState } from 'lexical'
import { MediaFile } from './payload-types'

/**
 * Canonical list of supported language codes.
 */
export const LANGUAGE_CODES = {
  EN: 'en',
  ES: 'es',
} as const

/**
 * Language type from codes.
 */
export type Language = (typeof LANGUAGE_CODES)[keyof typeof LANGUAGE_CODES]

/**
 * Friendly labels for each language.
 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  [LANGUAGE_CODES.EN]: 'English',
  [LANGUAGE_CODES.ES]: 'Spanish',
}

/**
 * Ordered list of languages used throughout the app.
 */
export const SUPPORTED_LANGUAGES: Language[] = Object.values(LANGUAGE_CODES)

/**
 * Prevents hard-coding the default language.
 */
export const DEFAULT_LANGUAGE: Language = LANGUAGE_CODES.EN

/**
 * Generic localized value keyed by language code.
 */
export type LocalizedValue<T> = Partial<Record<Language, T | null>>

/**
 * Localized plain text.
 */
export type LocalizedText = LocalizedValue<string>

/**
 * Localized rich text content (Lexical serialized editor state).
 */
export type LocalizedRichText = LocalizedValue<SerializedEditorState>

/**
 * Media type including file, url and raw alt text. Localized in LocalizedMedia.
 */
type LocalizedMediaAsset = {
  file: MediaFile
  src: string
  alt?: string
}

/**
 * Localized media asset (image + alt text).
 */
export type LocalizedMedia = LocalizedValue<LocalizedMediaAsset>

/**
 * Backwards compatibility exports (legacy names).
 */
export const LANGUAGES = LANGUAGE_CODES
