import { Block } from 'payload'
import { createLocalizedTextField } from '@cms/fields/localizedTextField'
import { Action } from './Action'

/**
 * A hero block with an image, heading text and action CTAs.
 */
export const Hero: Block = {
  slug: 'hero',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    createLocalizedTextField('heading', 'Primary Heading', true),
    createLocalizedTextField('subheading', 'Subheading'),
    {
      name: 'backgroundMedia',
      type: 'relationship',
      label: 'Background Media',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'actions',
      type: 'blocks',
      label: 'Actions',
      admin: {
        description: 'Actions rendered in reverse order (first item displays on right or bottom)',
      },
      maxRows: 2,
      blocks: [Action],
    }
  ],
}
