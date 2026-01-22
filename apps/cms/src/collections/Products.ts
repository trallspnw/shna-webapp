import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'nonMemberPriceUSD', 'isActive', 'isTest'],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'nonMemberPriceUSD',
      type: 'number',
    },
    {
      name: 'memberPriceUSD',
      type: 'number',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
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
