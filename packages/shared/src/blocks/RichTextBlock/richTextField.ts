import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { clearEmptyLocalizedRichText } from '@shna/shared/utilities/localizedFieldHooks'

type Overrides = Partial<Field>

export const richTextField = (overrides: Overrides = {}): Field => ({
  name: 'richText',
  type: 'richText',
  localized: true,
  hooks: {
    beforeValidate: [clearEmptyLocalizedRichText],
  },
  editor: lexicalEditor({
    features: ({ rootFeatures }) => {
      return [
        ...rootFeatures,
        HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ]
    },
  }),
  label: false,
  ...overrides,
})
