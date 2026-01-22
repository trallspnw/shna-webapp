import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { APIError } from 'payload'

export const Memberships: CollectionConfig = {
  slug: 'memberships',
  access: adminOnly,
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['contact', 'plan', 'startDay', 'endDay', 'campaign'],
  },
  fields: [
    {
      name: 'contact',
      label: 'Contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'plan',
      label: 'Plan',
      type: 'relationship',
      relationTo: 'membershipPlans',
      required: true,
    },
    {
      name: 'startDay',
      label: 'Start Day',
      type: 'date',
      required: true,
    },
    {
      name: 'endDay',
      label: 'End Day',
      type: 'date',
      required: true,
    },
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      admin: {
        position: 'sidebar',
        description: 'How this record entered the database.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        if (!data) return data

        const startValue = data.startDay ?? originalDoc?.startDay
        const endValue = data.endDay ?? originalDoc?.endDay

        if (!startValue || !endValue) {
          if (operation === 'create') {
            throw new APIError('Start day and end day are required.', 400)
          }
          return data
        }

        const start = new Date(startValue)
        const end = new Date(endValue)

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          throw new APIError('Start day and end day must be valid dates.', 400)
        }

        if (start > end) {
          throw new APIError('Start day must be before or equal to end day.', 400)
        }

        return data
      },
    ],
  },
}
