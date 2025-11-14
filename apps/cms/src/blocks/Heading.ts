import { Block } from "payload";
import { createLocalizedTextField } from "@cms/fields/localizedTextField";

/**
 * A heading block with localized text and configurable level.
 */
export const Heading: Block = {
  slug: 'heading',
  interfaceName: 'Heading',
  labels: {
    singular: 'Heading',
    plural: 'Headings',
  },
  fields: [
    createLocalizedTextField('text', 'Heading Text', true),
    {
      name: 'level',
      label: 'Heading Level',
      type: 'select',
      required: true,
      defaultValue: '2',
      options: [
        { label: 'H1', value: '1' },
        { label: 'H2', value: '2' },
        { label: 'H3', value: '3' },
        { label: 'H4', value: '4' },
        { label: 'H5', value: '5' },
        { label: 'H6', value: '6' },
      ],
      admin: {
        description: 'Choose the heading level (smaller is bigger)',
      },
    },
  ],
}
