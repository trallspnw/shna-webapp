import type { GlobalConfig } from 'payload'

import { link } from '@shna/shared/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'orgName',
      type: 'text',
      localized: true,
      admin: {
        placeholder: 'Friends of Seminary Hill Natural Area',
        description: 'Organization name shown as the heading in the footer.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: {
        placeholder: 'Volunteer-led. Community-rooted. Protecting 80 acres of Pacific Northwest woodland in the heart of Centralia, Washington.',
        description: 'Short tagline shown under the org name in the footer.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Quick Links',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@shna/shared/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'quickLinksLabel',
      type: 'text',
      localized: true,
      admin: {
        placeholder: 'Quick Links',
        description: 'Heading for the quick links column in the footer.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      maxRows: 8,
      admin: {
        description: 'Icons are automatically chosen based on the selected platform.',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { placeholder: 'https://...' },
        },
      ],
    },
    {
      name: 'socialLinksLabel',
      type: 'text',
      localized: true,
      admin: {
        placeholder: 'Follow the Hill',
        description: 'Heading for the social links column in the footer.',
      },
    },
    {
      name: 'copyright',
      type: 'text',
      admin: {
        placeholder: 'Seminary Hill Natural Area © 2025',
        description: 'Copyright line shown at the bottom of the footer.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
