import type { CheckoutIntent, Transaction } from '@shna/shared/payload-types'
import { getActiveMembershipByEmail } from '../lib/email'
import { generateReceiptEmail, generateMembershipEmail } from '../utilities/emailTemplates'
import { sendEmail } from '../lib/brevo'

// Type not exported by plugin? We'll define a compatible signature.
type StripeWebhookHandler = (args: { event: any; payload: any; stripe: any }) => Promise<void>

// Helper to get ID from relationship which might be populated or ID
const getId = (relation: any): string | number | undefined => {
  if (!relation) return undefined
  if (typeof relation === 'object' && 'id' in relation) return relation.id
  return relation
}

export const handleCheckoutSessionCompleted: StripeWebhookHandler = async (args) => {
  const { event, payload } = args

  const session = event.data.object as any
  const sessionId = session.id
  const customerEmail = session.customer_details?.email
  const paymentIntentId = session.payment_intent
  const amountTotal = session.amount_total || 0

  // 1. Find the intent
  const intents = await payload.find({
    collection: 'checkoutIntents',
    where: {
      stripeSessionId: { equals: sessionId },
    },
    limit: 1,
  })

  if (!intents.docs.length) {
    payload.logger.warn(`No CheckoutIntent found for session ${sessionId}`)
    return
  }

  const intent = intents.docs[0] as CheckoutIntent
  const isTest = intent.isTest

  // 2. Identify Contact (if allowed)
  let contactId: string | undefined = undefined
  let contactDoc: any = undefined

  if (customerEmail && !intent.stayAnon) {
    // Normalize
    const email = customerEmail.toLowerCase().trim()

    // Upsert contact
    const existing = await payload.find({
      collection: 'contacts',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      contactDoc = existing.docs[0]
      contactId = contactDoc.id
    } else {
      contactDoc = await payload.create({
        collection: 'contacts',
        data: {
          email,
          displayName: session.customer_details?.name || undefined,
          isTest: isTest || false,
        },
      })
      contactId = contactDoc.id
    }
  }

  // 3. Create Transaction
  const transaction = await payload.create({
    collection: 'transactions',
    data: {
      kind: intent.kind,
      status: 'succeeded',
      amountUSD: amountTotal / 100,
      paymentMethod: 'stripe',
      stripeId: paymentIntentId || sessionId,
      occurredAt: new Date().toISOString(),
      contact: contactId, // Explicitly undefined if no contact
      stayAnon: intent.stayAnon || false,
      pricingBasis: intent.pricingBasis,
      order: getId(intent.order),
      event: getId(intent.event),
      membershipTerm: undefined, // Linked optionally below
      isTest: isTest,
    },
  })

  // 4. Specific Logic by Kind
  if (intent.kind === 'membership' && contactId && intent.membershipAccount && intent.plan) {
    const planId = getId(intent.plan)
    const accountId = getId(intent.membershipAccount)

    // Look up plan details for duration
    const planDoc = await payload.findByID({ collection: 'membershipPlans', id: planId })

    // Look up active term for start date
    const activeStatus = await getActiveMembershipByEmail(payload, customerEmail)

    let startsAt = new Date()
    if (activeStatus.isActive && activeStatus.expiresAt) {
      const existingExpiry = new Date(activeStatus.expiresAt)
      if (existingExpiry > startsAt) {
        startsAt = existingExpiry
      }
    }

    const durationMonths = planDoc.durationMonths || 12
    const expiresAt = new Date(startsAt)
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths)

    const term = await payload.create({
      collection: 'membershipTerms',
      data: {
        membershipAccount: accountId,
        plan: planId,
        status: 'active',
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        transaction: transaction.id,
        pricePaidUSD: amountTotal / 100,
        isTest: isTest,
      },
    })

    // Send Membership Email
    if (contactDoc) {
      const { subject, html } = generateMembershipEmail(
        contactDoc,
        term,
        planDoc.name || 'Membership',
      )
      await sendEmail({ to: customerEmail, subject, html })
    }
  } else if (intent.kind === 'retail' && intent.order) {
    const orderId = getId(intent.order)
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'paid',
      },
    })
  }

  // Send Receipt (Unified for all payments if amount > 0)
  // Logic: Send if we have email AND ( !stayAnon OR stayAnon=true is OK for receipt only )
  if (amountTotal > 0 && customerEmail) {
    const { subject, html } = generateReceiptEmail({
      amountUSD: amountTotal / 100,
      occurredAt: new Date().toISOString(),
      stripeId: paymentIntentId || sessionId,
    } as Transaction)
    await sendEmail({ to: customerEmail, subject, html })
  }
}
