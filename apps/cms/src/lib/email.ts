import { Payload } from 'payload'
import { MembershipTerm, MembershipPlan } from '@shna/shared/payload-types'

export function normalizeEmail(email: string): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

type MembershipStatusResult = {
  isActive: boolean
  membershipAccountId?: string | null
  planKey?: string | null
  expiresAt?: string | null
}

export async function getActiveMembershipByEmail(
  payload: Payload,
  email: string,
): Promise<MembershipStatusResult> {
  const normalized = normalizeEmail(email)

  // 1. Find contact
  const contacts = await payload.find({
    collection: 'contacts',
    where: {
      email: { equals: normalized },
    },
    limit: 1,
  })

  if (!contacts.docs.length) {
    return { isActive: false }
  }
  const contactId = contacts.docs[0].id

  // 2. Find membership account where this contact is primary OR secondary
  // Searching 'membershipAccounts' first logic:
  const accounts = await payload.find({
    collection: 'membershipAccounts',
    where: {
      or: [{ primaryContact: { equals: contactId } }, { secondaryContacts: { equals: contactId } }],
    },
    limit: 1,
  })

  if (!accounts.docs.length) {
    return { isActive: false }
  }
  const account = accounts.docs[0]

  // 3. Find ACTIVE terms for this account
  const now = new Date().toISOString()
  const terms = await payload.find({
    collection: 'membershipTerms',
    where: {
      and: [
        { membershipAccount: { equals: account.id } },
        { status: { equals: 'active' } },
        { expiresAt: { greater_than: now } }, // Ensure future expiration
      ],
    },
    sort: '-expiresAt', // Get the latest one if overlap
    limit: 1,
  })

  if (!terms.docs.length) {
    // Found account but no active term
    return {
      isActive: false,
      membershipAccountId: account.id,
    }
  }

  const term = terms.docs[0]

  return {
    isActive: true,
    membershipAccountId: account.id,
    planKey: term.planKeySnapshot,
    expiresAt: term.expiresAt,
  }
}

export function isRenewable(
  term: MembershipTerm,
  plan: MembershipPlan,
  nowDate: Date = new Date(),
): boolean {
  if (!term.expiresAt || !plan.renewalWindowDays) return false

  const expiresAt = new Date(term.expiresAt)
  const renewWindowMs = plan.renewalWindowDays * 24 * 60 * 60 * 1000
  const renewableFrom = new Date(expiresAt.getTime() - renewWindowMs)

  // Renewable if we are within the window (after renewableFrom)
  // And usually we allow renewal even slightly after expiration (though term might be 'expired' status)
  return nowDate >= renewableFrom
}
