import { CollectionConfig } from 'payload'
import { createLocalizedTextField } from '@cms/fields/localizedTextField'
import { allBlocks } from '../lib/allBlocks'
import { DEFAULT_LANGUAGE } from '@/packages/common/src/types/language'

/**
 * These pages should never be allowed to be displayed in the nav.
 */
const hideFromNav = ['home', 'not-found']

/**
 * All root level pages are configured with this page collection. Pages may be configured to show in the nav or hidden
 * to only be accessible by direct link. Blocks are used to configure page content and layout.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
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
        description: 'Part of the URL which routes to this page'
      },
      required: true,
      unique: true,
    },

    // Internal title is pulled from the page configured page title for the default language
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
      'Page Title', 
      true,
    ),
    {
      name: 'showInNav',
      type: 'checkbox',
      label: 'Show Page in Primary Navigation',
      admin: {
        condition: (_, siblingData) => {
          return !(hideFromNav.includes(siblingData?.slug))
        },
      },
    },
    {
      name: 'navigationOptions',
      type: 'group',
      label: 'Navigation Options',
      admin: {
        condition: (_, siblingData) => {
          return siblingData?.showInNav === true;
        },
        description: 'Pages with lower values will be listed first'
      },
      fields: [
        // Priority value used for ordering the nav links. Does not need to be sequential. 
        {
          name: 'navOrder',
          type: 'number',
          label: 'Navigation Order',
        },
        createLocalizedTextField(
          'navLabel', 
          'Navigation Label',
          true,
        )
      ]
    },
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Page Content',
      blocks: allBlocks,
    },
  ],
}
