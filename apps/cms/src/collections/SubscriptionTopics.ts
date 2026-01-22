import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { APIError } from 'payload'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

export const SubscriptionTopics: CollectionConfig = {
  slug: 'subscriptionTopics',
  access: adminOnly,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description'],
    description: 'Email list topics',
  },
  fields: [
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable identifier used in URLs. Set once.',
      },
    },
    {
      name: 'name',
      label: 'Topic Name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, originalDoc }) => {
        if (!data) return data

        if (operation === 'create') {
          const base = (data.slug ?? '').trim() || (data.name ?? '')
          const slug = slugify(base)

          if (!slug) {
            throw new APIError('Slug cannot be blank.', 400)
          }

          if (!/^[a-z0-9][a-z0-9-_]*$/.test(slug)) {
            throw new APIError(
              'Slug must start with a letter or number and include only lowercase letters, numbers, "-" or "_" characters.',
              400,
            )
          }

          return {
            ...data,
            slug,
          }
        }

        if (
          operation === 'update' &&
          typeof data.slug !== 'undefined' &&
          data.slug !== originalDoc?.slug
        ) {
          throw new APIError('Slug cannot be changed after creation.', 400)
        }

        return data
      },
    ],
  },
}
