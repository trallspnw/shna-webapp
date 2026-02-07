import type { RichTextField } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { clearEmptyLocalizedRichText } from '@shna/shared/utilities/localizedFieldHooks'

type Overrides = Partial<RichTextField>

export const richTextField = (overrides: Overrides = {}): RichTextField => ({
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
        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
        FixedToolbarFeature(),
        InlineToolbarFeature(),
      ]
    },
  }),
  label: false,
  ...overrides,
})
