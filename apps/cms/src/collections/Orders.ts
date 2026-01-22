import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: adminOnly,
  admin: {
    useAsTitle: 'publicId',
    defaultColumns: ['publicId', 'status', 'totalUSD', 'contact', 'updatedAt'],
  },
  fields: [
    {
      name: 'publicId',
      type: 'text',
      unique: true,
      required: true,
      validate: (value: unknown) => {
        if (typeof value !== 'string') return 'Must be a UUID string.'
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(value) ? true : 'Must be a valid UUID.'
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Paid', value: 'paid' },
        { label: 'Expired', value: 'expired' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'created',
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
    },
    {
      name: 'lang',
      type: 'text',
    },
    {
      name: 'totalUSD',
      type: 'number',
      required: true,
    },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      index: true,
      admin: {
        description: 'Required after session creation; may be empty at initial order creation.',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      index: true,
    },
    {
      name: 'receiptEmailSendId',
      type: 'text',
    },
  ],
}
