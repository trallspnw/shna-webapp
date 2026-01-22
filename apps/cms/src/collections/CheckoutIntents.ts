import type { CollectionConfig } from 'payload'

export const CheckoutIntents: CollectionConfig = {
  slug: 'checkoutIntents',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'kind', 'stripeSessionId', 'createdAt'],
  },
  fields: [
    {
      name: 'stripeSessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
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
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
    },
    {
      name: 'refRaw',
      type: 'text',
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
    },
    {
      name: 'plan',
      type: 'relationship',
      relationTo: 'membershipPlans',
    },
    {
      name: 'membershipAccount',
      type: 'relationship',
      relationTo: 'membershipAccounts',
    },
    {
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
