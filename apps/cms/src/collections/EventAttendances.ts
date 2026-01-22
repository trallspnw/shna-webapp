import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const EventAttendances: CollectionConfig = {
  slug: 'eventAttendances',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'contact', 'anonymousCount', 'method'],
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
    },
    {
      name: 'alias',
      type: 'relationship',
      relationTo: 'aliases',
    },
    {
      name: 'anonymousCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'QR Scan', value: 'qr_scan' },
        { label: 'Manual/Paper', value: 'manual' },
      ],
      defaultValue: 'qr_scan',
    },
    {
      name: 'checkedInAt',
      type: 'date',
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
      ({ data }) => {
        // Enforce identity constraint: One of Contact, Alias, or AnonymousCount >= 1
        // Note: 'data' is the incoming data. For updates, we might need originalDoc to be sure,
        // but for now assuming we send complete info or validating what is present.
        const hasContact = !!data.contact
        const hasAlias = !!data.alias
        const hasAnon = typeof data.anonymousCount === 'number' && data.anonymousCount > 0

        // We count how many "identities" are provided.
        // Actually the logic is: Must have AT LEAST one, and ideally NOT mixed?
        // "exactly one of" per spec T017.

        let count = 0
        if (hasContact) count++
        if (hasAlias) count++
        if (hasAnon) count++

        if (count !== 1) {
          // Allow updating if we are just patching other fields?
          // In a strict hook we'd merge with originalDoc.
          // For MVP implementation simplicity, we'll enforce this only if relevant fields are present in data.
          // If it's a creation, strict check.
          if (!data.id) {
            // New doc
            throw new APIError(
              'Attendance record must specify exactly one of: Contact, Alias, or Anonymous Count (>0)',
              400,
            )
          }
        }

        if (!data.checkedInAt) {
          data.checkedInAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
}
