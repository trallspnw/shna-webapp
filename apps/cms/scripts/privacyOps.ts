import { getPayload } from 'payload'
import config from '../src/payload.config'
import fs from 'fs'

const args = process.argv.slice(2)
const command = args[0]
const emailFlagIndex = args.indexOf('--email')
const emailArg = emailFlagIndex >= 0 ? args[emailFlagIndex + 1] : args[1]
const dryRun = args.includes('--dry-run')

if (!command || !['export', 'anonymize'].includes(command) || !emailArg) {
  console.log(
    'Usage: pnpm tsx scripts/privacyOps.ts <export|anonymize> --email <email> [--dry-run]',
  )
  process.exit(1)
}

const normalizeEmail = (value: string) => value.toLowerCase().trim()

const run = async () => {
  const payload = await getPayload({ config })
  const normalizedEmail = normalizeEmail(emailArg)

  // Find Contact
  const contacts = await payload.find({
    collection: 'contacts',
    where: { email: { equals: normalizedEmail } },
  })

  if (!contacts.docs.length) {
    console.log(`No contact found for ${normalizedEmail}`)
    process.exit(0)
  }

  const contact = contacts.docs[0]
  const contactId = contact.id
  console.log(`Found contact: ${contact.id} (${contact.displayName || 'n/a'})`)

  const memberships = await payload.find({
    collection: 'memberships',
    where: { contact: { equals: contactId } },
    limit: 500,
  })

  const related = {
    memberships: memberships.docs,
    transactions: (
      await payload.find({
        collection: 'transactions',
        where: { contact: { equals: contactId } },
        limit: 500,
      })
    ).docs,
    orders: (
      await payload.find({
        collection: 'orders',
        where: { contact: { equals: contactId } },
        limit: 500,
      })
    ).docs,
    subscriptions: (
      await payload.find({
        collection: 'subscriptions',
        where: { contact: { equals: contactId } },
        limit: 500,
      })
    ).docs,
  }

  if (command === 'export') {
    const dump = {
      contact,
      related,
    }

    const filename = `export-${normalizedEmail}.json`
    if (dryRun) {
      console.log(`[dry-run] Would write ${filename}`)
    } else {
      fs.writeFileSync(filename, JSON.stringify(dump, null, 2))
      console.log(`Exported to ${filename}`)
    }
  }

  if (command === 'anonymize') {
    console.log(`Anonymizing data...${dryRun ? ' (dry-run)' : ''}`)

    if (!dryRun) {
      await payload.update({
        collection: 'contacts',
        id: contactId,
        data: {
          email: `anonymized-${contactId}@deleted.local`,
          displayName: null,
          phone: null,
          address: null,
        },
      })
    }

    for (const order of related.orders) {
      if (!dryRun) {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            contact: undefined,
          },
        })
      }
    }

    for (const txn of related.transactions) {
      if (!dryRun) {
        await payload.update({
          collection: 'transactions',
          id: txn.id,
          data: {
            contact: undefined,
          },
        })
      }
    }

    for (const sub of related.subscriptions) {
      if (!dryRun) {
        await payload.delete({ collection: 'subscriptions', id: sub.id })
      }
    }

    console.log('Anonymization complete.')
  }

  process.exit(0)
}

run()
