import type { CollectionConfig } from 'payload'

export const MembershipAccounts: CollectionConfig = {
  slug: 'membershipAccounts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'type', 'primaryContact', 'isTest'],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Household', value: 'household' },
      ],
      defaultValue: 'individual',
      required: true,
    },
    {
      name: 'primaryContact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'secondaryContacts',
      type: 'relationship',
      relationTo: 'contacts',
      hasMany: true,
      admin: {
        description: 'Adult members only. Do not add children here.',
      },
    },
    {
      name: 'anonymousMemberCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
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
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
