import { completeMembership, getHouseholdById } from '@/apps/cms/src/dao/membershipDao'
import { getPersonById } from '@/apps/cms/src/dao/personDao'
import { sendEmails } from '@/apps/cms/src/lib/email'
import { DEFAULT_LANGUAGE } from '@/packages/common/src/types/language'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { LRUCache } from 'lru-cache'
import { getEventFromWebhookRequest } from '@/apps/cms/src/lib/stripe'

/*
  Used for in memory cache. Stripe often triggers duplicate callbacks. This cache keeps track of recent triggers in 
  order to dedupe.
*/
const stripeEventCache = new LRUCache<string, true>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes
})

/**
 * API route for handling Stripe session changes.
 * @param request Stripe event information
 * @returns Acknowledgement
 */
export async function POST(request: NextRequest) {
  const eventOrError = await getEventFromWebhookRequest(request)

  if (typeof eventOrError === 'string') { 
    return NextResponse.json(
      { error: eventOrError },
      { status: 400 },
    )
  }
  const event = eventOrError as Stripe.Event

  // Filter to events to session completions
  if (event.type === 'checkout.session.completed') {
    // Use cache for idempotency
    const eventId = event.id
    if (stripeEventCache.has(eventId)) return NextResponse.json({ received: true })
    stripeEventCache.set(eventId, true)

    const session = event.data.object as Stripe.Checkout.Session

    const householdId = session.metadata?.householdId
    const personId = session.metadata?.personId
    const ref = session.metadata?.ref
    const itemType = session.metadata?.itemType
    const household = householdId ? await getHouseholdById(householdId) : undefined
    const person = personId ? await getPersonById(personId) : undefined

    // For memberships, update membership table and send an memberhip confirmation/receipt
    if (household && itemType == 'MEMBERSHIP') {
      await completeMembership(household.id, ref)
      const primary = household.primaryContact

      sendEmails(
        primary ? [ primary ] : [], 
        'membership-receipt', 
        {
          itemName: session.metadata?.itemName ?? 'Membership',
          amount: new Intl.NumberFormat(primary?.language ?? DEFAULT_LANGUAGE, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          }).format((session.amount_total ?? 0) / 100),
        },
      )
    }

    // For donations, send donation receipt. 
    if (person && itemType == 'DONATION') {
      sendEmails(
        [ person ], 
        'donation-receipt', 
        {
          itemName: session.metadata?.itemName ?? 'Item',
          amount: new Intl.NumberFormat(person.language ?? DEFAULT_LANGUAGE, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          }).format((session.amount_total ?? 0) / 100),
        },
      )
    }
  }

  return NextResponse.json({ received: true })
}
