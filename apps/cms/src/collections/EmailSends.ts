import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { adminOnly } from '../access/adminOnly'

export const EmailSends: CollectionConfig = {
  slug: 'emailSends',
  access: adminOnly,
  admin: {
    useAsTitle: 'toEmail',
    defaultColumns: ['toEmail', 'status', 'template', 'sentAt', 'createdAt'],
  },
  fields: [
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'emailTemplates',
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'template',
      options: [
        { label: 'Template', value: 'template' },
        { label: 'Inline', value: 'inline' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'templateSlug',
      type: 'text',
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'toEmail',
      type: 'text',
      required: true,
    },
    {
      name: 'lang',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'queued',
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
    },
    {
      name: 'providerMessageId',
      type: 'text',
    },
    {
      name: 'errorCode',
      type: 'select',
      options: [
        { label: 'Missing recipient', value: 'missing_recipient' },
        { label: 'Template not found', value: 'template_not_found' },
        { label: 'Missing placeholders', value: 'missing_placeholders' },
        { label: 'Provider failed', value: 'provider_failed' },
      ],
    },
    {
      name: 'sentAt',
      type: 'date',
    },
    {
      name: 'error',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const hasTemplate = Boolean(data?.template)
        const hasSubject = typeof data?.subject === 'string' && data.subject.trim().length > 0

        if (!hasTemplate && !hasSubject) {
          throw new APIError('EmailSend requires template or subject.', 400)
        }
        return data
      },
    ],
  },
}
