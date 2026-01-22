import type { Block } from 'payload'

export const DonationBlock: Block = {
  slug: 'donationBlock',
  fields: [
    {
      name: 'header',
      type: 'text',
    },
    {
      name: 'suggestedAmounts',
      type: 'array',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
}
