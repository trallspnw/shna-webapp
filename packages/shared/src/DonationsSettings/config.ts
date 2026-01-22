import type { GlobalConfig } from 'payload'

export const DonationsSettings: GlobalConfig = {
  slug: 'donations-settings',
  label: 'Donations Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'maxDonationUSD',
      label: 'MAX_DONATION_USD',
      type: 'number',
      defaultValue: 10000,
      admin: {
        description: 'Prevents mistakes/abuse; can be raised if needed.',
      },
    },
  ],
}
