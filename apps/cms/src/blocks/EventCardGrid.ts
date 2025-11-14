import { Block } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * A block to show a grid of events. Options allow for showing future or past events, a specific number of rows, and 
 * psuedo-pagination. 
 */
export const EventCardGrid: Block = {
  slug: 'eventCardGrid',
  interfaceName: 'EventCardGrid',
  labels: {
    singular: 'Event Card Grid',
    plural: 'Event Card Grids',
  },
  fields: [
    createLocalizedTextField(
      'heading', 
      'Heading Text', 
      false,
    ),
    {
      name: 'rowsToShow',
      type: 'number',
      label: 'Rows to Display',
      required: true,
      defaultValue: 2,
      min: 1,
    },
    {
      name: 'filter',
      type: 'radio',
      label: 'Which Events to Show',
      required: true,
      defaultValue: 'upcoming',
      options: [
        {
          label: 'Upcoming Events',
          value: 'upcoming',
        },
        {
          label: 'Past Events',
          value: 'past',
        },
      ],
    },
    createLocalizedTextField(
      'showMoreLabel', 
      'Show More Label', 
      false,
      'Enables a "Show more" button'
    )
  ],
}
