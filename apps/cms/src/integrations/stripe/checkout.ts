import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-12-15.clover',
})

export type CreateCheckoutSessionArgs = {
  amountCents: number
  email: string
  successUrl: string
  cancelUrl: string
  name: string
  locale?: 'en' | 'es'
  metadata?: Record<string, string>
}

export type CheckoutSessionResult = {
  id: string
  url: string | null
}

export const createCheckoutSession = async (
  args: CreateCheckoutSessionArgs,
): Promise<CheckoutSessionResult> => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: args.name,
          },
          unit_amount: args.amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: args.email,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    locale: args.locale,
    metadata: args.metadata,
  })

  return { id: session.id, url: session.url }
}
