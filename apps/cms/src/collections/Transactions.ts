import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['kind', 'amountUSD', 'status', 'contact', 'isTest'],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Donation', value: 'donation' },
        { label: 'Retail', value: 'retail' },
      ],
      required: true,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Cash', value: 'cash' },
        { label: 'Check', value: 'check' },
        { label: 'Comp', value: 'comp' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'amountUSD',
      type: 'number',
      required: true,
    },
    {
      name: 'stayAnon',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'pricingBasis',
      type: 'select',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Non-Member', value: 'non_member' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'membershipTerm',
      type: 'relationship',
      relationTo: 'membershipTerms',
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },
    {
      name: 'stripeId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'occurredAt',
      type: 'date',
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
      ({ data }) => {
        if (!data.occurredAt) {
          data.occurredAt = new Date().toISOString()
        }
        if (data.stayAnon && data.contact) {
          // Prevent accidental linkage
          // In a real app we might throw error or silently clear it.
          // Per spec T019: enforce contact must be null.
          throw new APIError('Cannot link Contact to a Transaction marked "Stay Anonymous"', 400)
        }
        return data
      },
    ],
  },
}
