import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const OrderItems: CollectionConfig = {
  slug: 'orderItems',
  access: adminOnly,
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'itemType',
      type: 'select',
      required: true,
      options: [
        { label: 'Donation', value: 'donation' },
        { label: 'Membership', value: 'membership' },
        { label: 'Retail', value: 'retail' },
      ],
    },
    {
      name: 'label',
      type: 'text',
    },
    {
      name: 'unitAmountUSD',
      type: 'number',
      required: true,
    },
    {
      name: 'qty',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        step: 1,
      },
      validate: (value: unknown) => {
        if (typeof value !== 'number') return 'Must be a number.'
        return Number.isInteger(value) ? true : 'Must be an integer.'
      },
    },
    {
      name: 'totalUSD',
      type: 'number',
      required: true,
    },
  ],
}
