import type { CollectionConfig } from 'payload'

export const OrderItems: CollectionConfig = {
  slug: 'orderItems',
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
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'variant',
      type: 'text',
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'unitPriceUSD',
      type: 'number',
      required: true,
    },
    {
      name: 'totalUSD',
      type: 'number',
      admin: {
        readOnly: true,
      },
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
        if (data.quantity && data.unitPriceUSD !== undefined) {
          data.totalUSD = data.quantity * data.unitPriceUSD
        }
        return data
      },
    ],
  },
}
