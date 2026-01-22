import type {
  StripeCheckoutSessionEvent,
  StripeCheckoutSessionEventType,
  StripeCheckoutSessionSummary,
} from './types'

const extractSession = (event: any): StripeCheckoutSessionSummary | null => {
  const session = event?.data?.object
  if (!session || !session.id) return null

  return {
    sessionId: String(session.id),
    paymentIntentId: session.payment_intent ?? null,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    amountTotalCents: typeof session.amount_total === 'number' ? session.amount_total : null,
    metadata: session.metadata ?? null,
  }
}

export const normalizeCheckoutSessionEvent = (
  type: StripeCheckoutSessionEventType,
  event: unknown,
): StripeCheckoutSessionEvent | null => {
  const summary = extractSession(event)
  if (!summary) return null

  return {
    type,
    session: summary,
  }
}
