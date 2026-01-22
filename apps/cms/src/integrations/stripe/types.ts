export type StripeCheckoutSessionSummary = {
  sessionId: string
  paymentIntentId?: string | null
  customerEmail?: string | null
  amountTotalCents?: number | null
  metadata?: Record<string, unknown> | null
}

export type StripeCheckoutSessionEventType =
  | 'checkout.session.completed'
  | 'checkout.session.expired'

export type StripeCheckoutSessionEvent = {
  type: StripeCheckoutSessionEventType
  session: StripeCheckoutSessionSummary
}
