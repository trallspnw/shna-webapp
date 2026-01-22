import { PayloadHandler, PayloadRequest } from 'payload'
import Stripe from 'stripe'
import { parseAttribution } from '../lib/attribution'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-06-20',
})

/**
 * POST /api/checkout-session
 * Body: {
 *   kind: 'membership' | 'donation' | 'retail',
 *   email?: string,
 *   items?: Array<{ price: string, quantity: number }>, // for retail
 *   planKey?: string, // for membership
 *   donationAmount?: number, // for donation (dollars)
 *   stayAnon?: boolean,
 *   pricingBasis?: 'member' | 'non_member' | 'unknown',
 *   attribution?: Record<string, string>,
 *   successUrl: string,
 *   cancelUrl: string
 * }
 */
export const createCheckoutSession: PayloadHandler = async (req: PayloadRequest) => {
  if (!req.json) return new Response('Bad Request', { status: 400 })
  const body = (await req.json()) as any

  const { kind, email, stayAnon, successUrl, cancelUrl, attribution } = body

  if (!body.successUrl || !body.cancelUrl) {
    return new Response('Missing success/cancel URL', { status: 400 })
  }

  // Build Line Items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let planId: string | undefined
  let amountUSD: number | undefined

  if (kind === 'membership' && body.planKey) {
    // Lookup plan to get price
    const plans = await req.payload.find({
      collection: 'membershipPlans',
      where: { key: { equals: body.planKey } },
      limit: 1,
    })
    if (!plans.docs.length) return new Response('Invalid planKey', { status: 400 })
    const plan = plans.docs[0]
    planId = plan.id

    // We assume we have a Stripe Price ID mapping or we create ad-hoc price
    // For MVP, we'll use ad-hoc price_data
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Membership: ${plan.name}`,
        },
        unit_amount: Math.round((plan.priceUSD || 0) * 100),
        recurring: {
          interval: 'year', // Simplification: assuming annual or based on duration
          // If plan.durationMonths != 12, Stripe recurring is trickier ad-hoc.
          // For now assuming 1 year as per 'annual' default.
        },
      },
      quantity: 1,
    })
  } else if (kind === 'donation' && body.donationAmount) {
    amountUSD = body.donationAmount
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Donation',
        },
        unit_amount: Math.round(body.donationAmount * 100),
      },
      quantity: 1,
    })
  } else if (kind === 'retail' && body.items) {
    // Simplification: assume body passes items or skip for this block
  }

  // Create Session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: kind === 'membership' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email, // Pre-fill if known
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        kind,
        ...parseAttribution(attribution || {}),
      },
    })

    // Create Intent (Audit Log)
    await req.payload.create({
      collection: 'checkoutIntents',
      data: {
        stripeSessionId: session.id,
        kind,
        stayAnon: !!stayAnon,
        pricingBasis: body.pricingBasis || 'unknown',
        plan: planId,
        refRaw: attribution?.ref,
        isTest: false,
      },
    })

    return Response.json({ url: session.url })
  } catch (err: any) {
    req.payload.logger.error(err)
    return new Response(err.message, { status: 500 })
  }
}
