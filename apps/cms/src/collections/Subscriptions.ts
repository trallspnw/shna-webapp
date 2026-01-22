import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['contact', 'topic', 'status', 'isTest'],
  },
  fields: [
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'subscriptionTopics',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Subscribed', value: 'subscribed' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
      ],
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
    },
    {
      name: 'refRaw',
      type: 'text',
    },
    {
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if ((operation === 'create' || operation === 'update') && data.contact && data.topic) {
          // Check for uniqueness of contact + topic
          const existing = await req.payload.find({
            collection: 'subscriptions',
            where: {
              and: [
                {
                  contact: {
                    equals: data.contact,
                  },
                },
                {
                  topic: {
                    equals: data.topic,
                  },
                },
              ],
            },
            limit: 1,
            depth: 0,
          })

          if (existing.totalDocs > 0) {
            // If updating, allow if it's the same doc
            if (operation === 'update' && originalDoc?.id === existing.docs[0].id) {
              return data
            }
            // NOTE: This check might be imperfect for simultaneous requests but covers the basic UI/API case.
            // Unique index in DB is better but Payload custom indexes are DB-specific.
            // For now relying on hook error.
            throw new APIError('Subscription already exists for this contact and topic', 400)
          }
        }
        return data
      },
    ],
  },
}
