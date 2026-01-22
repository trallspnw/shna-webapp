import type { CheckoutIntent } from '@shna/shared/payload-types'
import { getActiveMembershipByEmail } from '../lib/email'

// Type not exported by plugin? We'll define a compatible signature.
type StripeWebhookHandler = (args: { event: any; payload: any; stripe: any }) => Promise<void>

export const handleCheckoutSessionCompleted: StripeWebhookHandler = async (args) => {
  const { event, payload, stripe } = args

  const session = event.data.object as any
  const sessionId = session.id
  const customerEmail = session.customer_details?.email
  const paymentIntentId = session.payment_intent

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
  let contactId: string | null = null

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
      contactId = existing.docs[0].id
    } else {
      const newContact = await payload.create({
        collection: 'contacts',
        data: {
          email,
          displayName: session.customer_details?.name || undefined,
          isTest: isTest || false,
        },
      })
      contactId = newContact.id
    }
  }

  // 3. Create Transaction
  const transaction = await payload.create({
    collection: 'transactions',
    data: {
      kind: intent.kind,
      status: 'succeeded',
      amountUSD: (session.amount_total || 0) / 100,
      paymentMethod: 'stripe',
      stripeId: paymentIntentId || sessionId,
      occurredAt: new Date().toISOString(),
      contact: contactId ? contactId : undefined,
      stayAnon: intent.stayAnon || false,
      pricingBasis: intent.pricingBasis,
      order: typeof intent.order === 'string' ? intent.order : intent.order?.id,
      event: typeof intent.event === 'string' ? intent.event : intent.event?.id,
      isTest: isTest,
    },
  })

  // 4. Specific Logic by Kind
  if (intent.kind === 'membership' && contactId && intent.membershipAccount && intent.plan) {
    // Create Membership Term
    const planId = typeof intent.plan === 'object' ? intent.plan.id : intent.plan
    const accountId =
      typeof intent.membershipAccount === 'object'
        ? intent.membershipAccount.id
        : intent.membershipAccount

    // Look up plan details for duration
    const planDoc = await payload.findByID({ collection: 'membershipPlans', id: planId })

    // Look up active term for start date
    const activeStatus = await getActiveMembershipByEmail(payload, customerEmail)

    let startsAt = new Date()
    if (activeStatus.isActive && activeStatus.expiresAt) {
      // If active, start after current expiration
      const existingExpiry = new Date(activeStatus.expiresAt)
      if (existingExpiry > startsAt) {
        startsAt = existingExpiry
      }
    }

    const durationMonths = planDoc.durationMonths || 12
    const expiresAt = new Date(startsAt)
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths)

    await payload.create({
      collection: 'membershipTerms',
      data: {
        membershipAccount: accountId,
        plan: planId,
        status: 'active',
        startsAt: startsAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        transaction: transaction.id,
        pricePaidUSD: (session.amount_total || 0) / 100,
        isTest: isTest,
      },
    })

    // Also link transaction to term? (Transaction has 'membershipTerm' field, we might need to patch it
    // OR we just rely on term -> transaction link. The ERD has both directions usually or one.
    // Transactions.ts has relationship to Terms. Let's patch it for completeness if easy,
    // but Term->Transaction is the critical Audit link.)
  } else if (intent.kind === 'retail' && intent.order) {
    const orderId = typeof intent.order === 'string' ? intent.order : intent.order.id
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'paid',
      },
    })

    // Link order to transaction (already done in create transaction step above)
  }
}
