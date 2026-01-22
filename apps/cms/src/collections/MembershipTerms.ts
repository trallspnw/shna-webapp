import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const MembershipTerms: CollectionConfig = {
  slug: 'membershipTerms',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['membershipAccount', 'plan', 'status', 'expiresAt', 'isTest'],
  },
  fields: [
    {
      name: 'membershipAccount',
      type: 'relationship',
      relationTo: 'membershipAccounts',
      required: true,
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'membershipPlans',
      required: true,
    },
    {
      name: 'planKeySnapshot',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'pricePaidUSD',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Comped', value: 'comped' },
      ],
      required: true,
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'renewedFromTerm',
      type: 'relationship',
      relationTo: 'membershipTerms',
    },
    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
    },
    {
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Populating planKeySnapshot
        if (data.plan) {
          const plan = await req.payload.findByID({
            collection: 'membershipPlans',
            id: data.plan,
          })
          if (plan) {
            data.planKeySnapshot = plan.key
          }
        }

        // Date validation
        if (data.startsAt && data.expiresAt) {
          const start = new Date(data.startsAt)
          const end = new Date(data.expiresAt)
          if (end <= start) {
            // Check if we specifically set them, or if they are just present in data
            // Ideally we should check if they are changing or if it's a new doc,
            // but 'data' here contains the incoming data.
            // We'll throw if they are invalid.
            throw new APIError('Expiration date must be after start date', 400)
          }
        }
        return data
      },
    ],
  },
}
