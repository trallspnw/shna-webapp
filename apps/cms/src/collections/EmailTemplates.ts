import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import {
  clearEmptyLocalizedText,
  clearEmptyLocalizedRichText,
  requireDefaultLocale,
} from '@shna/shared/utilities/localizedFieldHooks'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const EmailTemplates: CollectionConfig = {
  slug: 'emailTemplates',
  access: adminOnly,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['slug', 'name', 'status', 'updatedAt'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Disabled', value: 'disabled' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      localized: true,
      hooks: {
        beforeValidate: [clearEmptyLocalizedText],
      },
      validate: requireDefaultLocale,
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      hooks: {
        beforeValidate: [clearEmptyLocalizedRichText],
      },
      validate: requireDefaultLocale,
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
    },
    {
      name: 'placeholders',
      type: 'array',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
  ],
}
