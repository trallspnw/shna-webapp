import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { APIError } from 'payload'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  access: adminOnly,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'reftag'],
    description: 'Structured attempts to attract engagement',
  },
  fields: [
    {
      name: 'name',
      label: 'Campaign Name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'reftag',
      label: 'Reftag',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Reftag to associate with this campaign. This is included in links.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        if (!data) return data

        if (typeof data.reftag === 'undefined') {
          return data
        }

        const normalizedReftag = data.reftag.trim().toLowerCase()

        if (!normalizedReftag) {
          throw new APIError('Reftag cannot be blank.', 400)
        }

        const isValid = /^[a-z0-9][a-z0-9-_]*$/.test(normalizedReftag)
        if (!isValid) {
          throw new APIError(
            'Reftag must start with a letter or number and include only lowercase letters, numbers, "-" or "_" characters.',
            400,
          )
        }

        if (operation === 'update' && normalizedReftag !== originalDoc?.reftag) {
          throw new APIError('Reftag cannot be changed after creation.', 400)
        }

        return {
          ...data,
          reftag: normalizedReftag,
        }
      },
    ],
  },
}
