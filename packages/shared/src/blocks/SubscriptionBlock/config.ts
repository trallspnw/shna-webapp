import type { Block } from 'payload'

export const SubscriptionBlock: Block = {
  slug: 'subscriptionBlock',
  fields: [
    {
      name: 'header',
      type: 'text',
      label: 'Header Text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'topics',
      type: 'text',
      hasMany: true,
      defaultValue: ['general'],
      label: 'Topics (slugs)',
      admin: {
        hidden: true,
        description: 'Advanced: topic slugs used by the subscription API.',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Subscribe',
    },
    {
      name: 'emailLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Email',
    },
    {
      name: 'modalTitle',
      type: 'text',
      localized: true,
      defaultValue: 'Subscribing...',
    },
    {
      name: 'loadingText',
      type: 'text',
      localized: true,
      defaultValue: 'Submitting your request...',
    },
    {
      name: 'successText',
      type: 'text',
      localized: true,
      defaultValue: "You're subscribed.",
    },
    {
      name: 'errorText',
      type: 'text',
      localized: true,
      defaultValue: 'Something went wrong. Please try again.',
    },
    {
      name: 'closeLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Close',
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'subscriptionTopics',
      required: false,
      admin: {
        hidden: true,
        description: 'Deprecated. Use topics (slugs) instead.',
      },
    },
  ],
}
