import { Block } from 'payload'
import { commonBlocks } from '../lib/commonBlocks'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * An Accordion block which can be added to pages. Contains other common blocks.
 */
export const Accordion: Block = {
  slug: 'accordion',
  interfaceName: 'Accordion',
  labels: {
    singular: 'Accordion',
    plural: 'Accordions',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Accordion Items',
      required: true,
      fields: [
        createLocalizedTextField('title', 'Title', true),
        {
          name: 'content',
          type: 'blocks',
          label: 'Content Blocks',
          blocks: commonBlocks,
        },
      ],
    },
  ],
}
