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

export const MembershipPlans: CollectionConfig = {
  slug: 'membershipPlans',
  access: {
    read: () => true,
    create: adminOnly.create,
    update: adminOnly.update,
    delete: adminOnly.delete,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'price', 'renewalWindowDays'],
  },
  fields: [
    {
      name: 'slug',
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
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      validate: (value: unknown) => {
        if (typeof value !== 'number') return 'Must be a number.'
        return value > 0 ? true : 'Must be greater than 0.'
      },
    },
    {
      name: 'renewalWindowDays',
      type: 'number',
      required: true,
      defaultValue: 30,
      validate: (value: unknown) => {
        if (typeof value !== 'number') return 'Must be a number.'
        return value >= 0 ? true : 'Must be 0 or greater.'
      },
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

          data.slug = slug
        }

        if (
          operation === 'update' &&
          typeof data.slug !== 'undefined' &&
          data.slug !== originalDoc?.slug
        ) {
          throw new APIError('Slug cannot be changed after creation.', 400)
        }

        if (typeof data.price !== 'undefined' && data.price <= 0) {
          throw new APIError('Price must be greater than 0.', 400)
        }

        if (typeof data.renewalWindowDays !== 'undefined' && data.renewalWindowDays < 0) {
          throw new APIError('Renewal window days must be 0 or greater.', 400)
        }

        return data
      },
    ],
  },
}
