import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  access: adminOnly,
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['order', 'amountUSD', 'paymentType', 'contact', 'createdAt'],
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'amountUSD',
      type: 'number',
      required: true,
    },
    {
      name: 'paymentType',
      type: 'select',
      required: true,
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Cash', value: 'cash' },
        { label: 'Check', value: 'check' },
      ],
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'stripeRefId',
      type: 'text',
    },
  ],
}
