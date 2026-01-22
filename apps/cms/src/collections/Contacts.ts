import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  access: adminOnly,
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['email', 'name'],
    description: 'Members of the public who engage with the organization',
  },
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea',
    },
    {
      name: 'language',
      label: 'Language',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
      ],
      defaultValue: 'en',
    },
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      admin: {
        position: 'sidebar',
        description: 'How this record entered the database.',
      },
    },
    {
      name: 'lastEngagedAt',
      label: 'Last Engaged',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Updated on membership purchase, check-ins, and opt-in transactions.',
        readOnly: true,
      },
    },
    {
      name: 'isTest',
      label: 'Test',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Checked if contact was created during a test.',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data

        const email = data.email?.toLowerCase().trim()
        const name = data.name?.trim()

        return {
          ...data,
          email,
          displayName: name || email,
        }
      },
    ],
  },
}
