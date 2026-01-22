import type { CollectionConfig } from 'payload'

export const Aliases: CollectionConfig = {
  slug: 'aliases',
  admin: {
    useAsTitle: 'id',
    hidden: true, // Hide from nav by default as per req "admin access restricted" sort of
  },
  fields: [
    // Basic placeholder fields for now as per "design-in, not launched"
    {
      name: 'key',
      type: 'text',
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
