import type { Block } from 'payload'

export const MembershipBlock: Block = {
  slug: 'membershipBlock',
  fields: [
    {
      name: 'header',
      type: 'text',
      label: 'Header Text',
    },
    {
      name: 'featuredPlans',
      type: 'relationship',
      relationTo: 'membershipPlans',
      hasMany: true,
      label: 'Featured Plans',
    },
  ],
}
