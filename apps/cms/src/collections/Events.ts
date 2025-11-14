import { CollectionConfig } from 'payload'
import { createLocalizedTextField } from '@cms/fields/localizedTextField'
import { allBlocks } from '../lib/allBlocks'
import { DEFAULT_LANGUAGE } from '@/packages/common/src/types/language'

/**
 * Events used to render event pages and event tiles. Event pages render configured blocks.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'titleText',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        description: 'Part of the URL which routes to this event'
      },
      required: true,
      unique: true,
    },
    {
      name: 'titleText',
      type: 'text',
      admin: {
        readOnly: true,
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) => {
            return siblingData?.title?.[DEFAULT_LANGUAGE] ?? ''
          },
        ],
      },
    },
    createLocalizedTextField(
      'title',
      'Event Title', 
      true,
    ),
    createLocalizedTextField(
      'location', 
      'Location', 
      true,
    ),
    {
      name: 'dateTime',
      label: 'Date and Time',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'media',
      type: 'relationship',
      label: 'Event Media',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Section Content',
      blocks: allBlocks,
    },
  ],
}
