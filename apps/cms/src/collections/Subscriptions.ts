import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { syncContactToList } from '@/lib/brevo'

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
            throw new APIError('Subscription already exists for this contact and topic', 400)
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // If subscribed, sync to brevo
        if (doc.status === 'subscribed' && doc.contact && doc.topic) {
          const topicId = typeof doc.topic === 'object' ? doc.topic.id : doc.topic
          const contactId = typeof doc.contact === 'object' ? doc.contact.id : doc.contact

          // Fetch full topic to get list ID
          const topic = await req.payload.findByID({
            collection: 'subscriptionTopics',
            id: topicId,
          })

          if (topic && topic.brevoListId) {
            const contact = await req.payload.findByID({ collection: 'contacts', id: contactId })
            if (contact && contact.email) {
              await syncContactToList(contact.email, topic.brevoListId)
            }
          }
        }
        return doc
      },
    ],
  },
}
