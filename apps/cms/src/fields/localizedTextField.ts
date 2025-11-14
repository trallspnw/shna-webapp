import { DEFAULT_LANGUAGE, LANGUAGE_CODES, LANGUAGE_LABELS } from '@common/types/language'
import { Field } from 'payload'

/**
 * Localized plain-text field group.
 */
export const createLocalizedTextField = (name = 'text', label = 'Localized Text', required = false, description?: string): Field => ({
  name,
  type: 'group',
  label,
  admin: {
    description: description,
  },
  fields: Object.values(LANGUAGE_CODES).map((language) => ({
    name: language,
    type: 'textarea',
    label: `${LANGUAGE_LABELS[language]}`,
    required: required && language === DEFAULT_LANGUAGE,
  })),
})
