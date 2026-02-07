import type { CollectionConfig, Field } from 'payload'

import { adminOnly } from '../../access/adminOnly'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Container } from '@shna/shared/blocks/Container/config'
import { hero } from '@shna/shared/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '@shna/shared/utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  clearEmptyLocalizedText,
  requireDefaultLocale,
} from '@shna/shared/utilities/localizedFieldHooks'

const withLocalization = <T extends Field>(field: T): T => ({
  ...field,
  localized: true,
})

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: adminOnly.create,
    delete: adminOnly.delete,
    read: authenticatedOrPublished,
    update: adminOnly.update,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
          locale: req.locale,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
        locale: req.locale,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      hooks: {
        beforeValidate: [clearEmptyLocalizedText],
      },
      validate: requireDefaultLocale,
      required: false,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'contentMode',
              type: 'select',
              defaultValue: 'builder',
              options: [
                {
                  label: 'Builder',
                  value: 'builder',
                },
                {
                  label: 'HTML',
                  value: 'html',
                },
              ],
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                Container,
              ],
              admin: {
                initCollapsed: true,
                condition: (_, siblingData) => siblingData?.contentMode !== 'html',
              },
              validate: (value, { siblingData }) => {
                if (siblingData?.contentMode === 'html') return true
                return value && Array.isArray(value) && value.length > 0
                  ? true
                  : 'Layout is required when content mode is builder.'
              },
            },
            {
              name: 'html',
              type: 'code',
              localized: true,
              admin: {
                condition: (_, siblingData) => siblingData?.contentMode === 'html',
              },
              hooks: {
                beforeValidate: [clearEmptyLocalizedText],
              },
              validate: (value, args) => {
                if (args.siblingData?.contentMode !== 'html') return true
                return requireDefaultLocale(value, args)
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            withLocalization(
              MetaTitleField({
                hasGenerateFn: true,
              }) as Field,
            ),
            withLocalization(
              MetaImageField({
                relationTo: 'media',
              }) as Field,
            ),
            withLocalization(MetaDescriptionField({}) as Field),
            {
              name: 'noIndex',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Hide this page from search engines (noindex)',
              },
            },
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({
      overrides: (field) => {
        const slugFieldConfig = field.fields?.[1]
        if (slugFieldConfig && slugFieldConfig.type === 'text') {
          if (slugFieldConfig.admin?.components) {
            delete slugFieldConfig.admin.components
          }
        }
        return field
      },
    }),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
