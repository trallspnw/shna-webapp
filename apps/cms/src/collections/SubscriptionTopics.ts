import type { CollectionConfig } from 'payload'

export const SubscriptionTopics: CollectionConfig = {
  slug: 'subscriptionTopics',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key', 'slug', 'isActive', 'isTest'],
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
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'brevoListId',
      type: 'number',
      admin: {
        description: 'ID of the list in Brevo (e.g. 5)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
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
