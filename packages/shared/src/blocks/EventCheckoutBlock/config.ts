import type { Block } from 'payload'

export const EventCheckoutBlock: Block = {
  slug: 'eventCheckoutBlock',
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'showDescription',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
