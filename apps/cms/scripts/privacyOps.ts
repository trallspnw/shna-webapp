import { getPayload } from 'payload'
import config from '../src/payload.config'
import fs from 'fs'

const args = process.argv.slice(2)
const command = args[0]
const email = args[1]

if (!command || !['export', 'anonymize'].includes(command) || !email) {
  console.log('Usage: pnpm tsx scripts/privacyOps.ts <export|anonymize> <email>')
  process.exit(1)
}

const run = async () => {
  const payload = await getPayload({ config })

  // Find Contact
  const contacts = await payload.find({
    collection: 'contacts',
    where: { email: { equals: email.toLowerCase() } },
  })

  if (!contacts.docs.length) {
    console.log(`No contact found for ${email}`)
    process.exit(0)
  }

  const contact = contacts.docs[0]
  const contactId = contact.id
  console.log(`Found contact: ${contact.id} (${contact.displayName})`)

  // FETCH RELATED DATA
  const related = {
    transactions: await payload.find({
      collection: 'transactions',
      where: { contact: { equals: contactId } },
    }),
    subscriptions: await payload.find({
      collection: 'subscriptions',
      where: { contact: { equals: contactId } },
    }),
    eventAttendances: await payload.find({
      collection: 'eventAttendances',
      where: { contact: { equals: contactId } },
    }),
    membershipTerms: await payload.find({
      collection: 'membershipTerms',
      where: { 'membershipAccount.primaryContact': { equals: contactId } },
    }), // Querying nested might need optimization or loop accounts.
    // For now simple. actually membershipTerms link to Account. Account links to Contact.
    // Also direct user?
  }

  if (command === 'export') {
    const dump = {
      contact,
      related: {
        transactions: related.transactions.docs,
        subscriptions: related.subscriptions.docs,
        eventAttendances: related.eventAttendances.docs,
        // membershipTerms: ...
      },
    }

    fs.writeFileSync(`export-${email}.json`, JSON.stringify(dump, null, 2))
    console.log(`Exported to export-${email}.json`)
  }

  if (command === 'anonymize') {
    console.log('Anonymizing data...')

    // 1. Anonymize Contact
    await payload.update({
      collection: 'contacts',
      id: contactId,
      data: {
        email: `anonymized-${contactId}@deleted.local`,
        displayName: 'Anonymized User',
        phone: null,
        notes: 'Anonymized per request',
      },
    })

    // 2. Clear Transactions contact (if allowed? Or keep link to Anon user?)
    // Usually we keep the link to the anonymized user record for ledger integrity,
    // OR we unlink. T071 says "anonymize", usually meaning scrub PII. Scubbing the Contact record
    // effectively anonymizes the transactions linked to it, IF the transaction itself doesn't copy PII.
    // Transactions collection doesn't store email directly, it links to Contact.

    // 3. Subscriptions - Delete or Unsub?
    // Usually delete or set to opted-out with anon email.
    for (const sub of related.subscriptions.docs) {
      await payload.delete({ collection: 'subscriptions', id: sub.id })
    }

    console.log('Anonymization complete.')
  }

  process.exit(0)
}

run()
