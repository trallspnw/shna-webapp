import { DEFAULT_LANGUAGE, LANGUAGE_CODES, LANGUAGE_LABELS } from '@common/types/language'
import { Field } from 'payload'

/**
 * Rich text field group where each language has its own Lexical editor.
 */
export const createLocalizedRichTextField = (
  name = 'content',
  label = 'Localized Rich Text',
  required = false,
  description?: string,
): Field => ({
  name,
  type: 'group',
  label,
  admin: {
    description,
  },
  fields: Object.values(LANGUAGE_CODES).map(language => ({
    name: language,
    type: 'richText',
    label: LANGUAGE_LABELS[language],
    required: required && language === DEFAULT_LANGUAGE,
  })),
})
