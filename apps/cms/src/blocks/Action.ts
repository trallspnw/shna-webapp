import { Block } from 'payload'
import { createLocalizedTextField } from '@cms/fields/localizedTextField'
import { customActions } from '@common/lib/customActions'

/**
 * An Action block used to link to another page or trigger some action.
 */
export const Action: Block = {
  slug: 'action',
  interfaceName: 'Action',
  labels: {
    singular: 'Action',
    plural: 'Actions',
  },
  fields: [
    createLocalizedTextField('label', 'Label', true),
    {
      name: 'style',
      type: 'radio',
      label: 'Style',
      defaultValue: 'primary',
      required: true,
      options: [
        { label: 'Primary Button', value: 'primary' },
        { label: 'Secondary Button', value: 'secondary' },
        { label: 'Subtle Button', value: 'subtle' },
        { label: 'Text Link', value: 'link' },
      ],
    },
    {
      name: 'actionType',
      type: 'radio',
      label: 'Action Type',
      defaultValue: 'navigate',
      required: true,
      options: [
        { label: 'Navigate to URL', value: 'navigate' },
        { label: 'Custom Trigger', value: 'custom' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      required: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.actionType === 'navigate',
        description: '/example or https://example.com',
      },
    },
    {
      name: 'customActionKey',
      type: 'select',
      label: 'Custom Action',
      required: true,
      options: Object.entries(customActions).map(
        ([value, { label }]) => ({
          label,
          value,
        })
      ),
      admin: {
        condition: (_, siblingData) =>
          siblingData?.actionType === 'custom',
      },
    },
  ],
}
