import type { Block } from 'payload'

export const DonationBlock: Block = {
  slug: 'donationBlock',
  fields: [
    {
      name: 'header',
      type: 'text',
      label: 'Header Text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
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
    {
      name: 'defaultAmount',
      type: 'number',
      admin: {
        description: 'Optional default amount when no suggested values are configured.',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Donate',
    },
    {
      name: 'nameLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Name',
    },
    {
      name: 'emailLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Email',
    },
    {
      name: 'phoneLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Phone',
    },
    {
      name: 'addressLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Address',
    },
    {
      name: 'amountLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Amount (USD)',
    },
    {
      name: 'modalTitle',
      type: 'text',
      localized: true,
      defaultValue: 'Processing your donation...',
    },
    {
      name: 'loadingText',
      type: 'text',
      localized: true,
      defaultValue: 'Submitting your donation...',
    },
    {
      name: 'successText',
      type: 'text',
      localized: true,
      defaultValue: 'Thank you for your donation.',
    },
    {
      name: 'errorText',
      type: 'text',
      localized: true,
      defaultValue: 'Something went wrong. Please try again.',
    },
    {
      name: 'checkoutName',
      type: 'text',
      localized: true,
      admin: {
        description: 'Shown in Stripe checkout line items.',
      },
    },
    {
      name: 'closeLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Close',
    },
  ],
}
