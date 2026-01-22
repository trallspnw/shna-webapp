import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { publicRead_adminWrite } from '../access/publicRead_adminWrite'
import {
  clearEmptyLocalizedRichText,
  clearEmptyLocalizedText,
} from '@shna/shared/utilities/localizedFieldHooks'

export const Media: CollectionConfig = {
  slug: 'media',
  folders: false,
  admin: {
    description:
      'Media files are shared across locales. For localized imagery, upload a separate Media document and select it per locale.',
  },
  access: publicRead_adminWrite,
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      hooks: {
        beforeValidate: [clearEmptyLocalizedText],
      },
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      hooks: {
        beforeValidate: [clearEmptyLocalizedRichText],
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    disableLocalStorage: true,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
