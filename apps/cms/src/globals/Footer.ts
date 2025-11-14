import { GlobalConfig } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * The confil model for the footer.
 */
export const FooterGlobal: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  fields: [
    createLocalizedTextField(
      'slogan', 
      'Slogan', 
      false,
    ),
    {
      name: 'linkGroups',
      type: 'array',
      fields: [
        createLocalizedTextField(
          'groupName', 
          'Group Name', 
          true, 
          'Heading for link group',
        ),
        {
          name: 'links',
          type: 'array',
          fields: [
            { 
              name: 'url',
              type: 'text',
              label: 'URL',
              admin: {
                description: '/example or https://example.com',
              },
              required: true,
            },
            createLocalizedTextField(
              'label', 
              'Link Label', 
              true,
            ),
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      fields: [
        {
          name: 'url',
          type: 'text',
          label: 'Profile URL',
          required: true,
          admin: {
            description: 'https://facebook.com/handle',
          },
        },
      ],
    },
  ],
}
