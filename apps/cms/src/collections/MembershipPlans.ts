import type { CollectionConfig } from 'payload'

export const MembershipPlans: CollectionConfig = {
  slug: 'membershipPlans',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'priceUSD', 'durationMonths', 'isActive'],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'priceUSD',
      type: 'number',
    },
    {
      name: 'durationMonths',
      type: 'number',
      defaultValue: 12,
    },
    {
      name: 'renewalWindowDays',
      type: 'number',
      defaultValue: 30,
    },
    {
      name: 'isActive',
      type: 'checkbox',
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
}
