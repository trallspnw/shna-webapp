import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access/adminOnly'
import { APIError } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  access: adminOnly,
  admin: {
    useAsTitle: 'contact',
    defaultColumns: ['contact', 'topic'],
    description: 'Contacts who are subscribed to email list topics',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'contact',
      label: 'Contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'topic',
      label: 'Topic',
      type: 'relationship',
      relationTo: 'subscriptionTopics',
      required: true,
    },
    {
      name: 'campaign',
      label: 'Campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      admin: {
        position: 'sidebar',
        description: 'How this record entered the database.',
      },
    },
    {
      name: 'isTest',
      label: 'Test',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Checked if contact was created during a test.',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation, originalDoc }) => {
        if (!data) return data

        // Prevent changing the identity of an existing subscription row
        if (operation === 'update') {
          if (typeof data.contact !== 'undefined' && data.contact !== originalDoc?.contact) {
            throw new APIError('Subscription contact cannot be changed after creation.', 400)
          }
          if (typeof data.topic !== 'undefined' && data.topic !== originalDoc?.topic) {
            throw new APIError('Subscription topic cannot be changed after creation.', 400)
          }
        }

        const contactId = data.contact ?? originalDoc?.contact
        const topicId = data.topic ?? originalDoc?.topic
        const hasKey = typeof data.key === 'string' && data.key.length > 0

        if (!hasKey && contactId && topicId) {
          return {
            ...data,
            key: `${contactId}:${topicId}`,
          }
        }

        return data
      },
    ],
  },
}
