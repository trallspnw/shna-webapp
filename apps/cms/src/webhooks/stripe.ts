import type { StripeCheckoutSessionEventType } from '@/integrations/stripe/types'
import { normalizeCheckoutSessionEvent } from '@/integrations/stripe/normalize'
import { applyPaymentEvent } from '@/services/orders/service'

// Matches Payload Stripe plugin handler signature.
type StripeWebhookHandler = (args: { event: any; payload: any; stripe: any }) => Promise<void>

const handleCheckoutSessionEvent = (type: StripeCheckoutSessionEventType): StripeWebhookHandler => {
  return async ({ event, payload }) => {
    const normalized = normalizeCheckoutSessionEvent(type, event)
    if (!normalized?.session?.sessionId) {
      payload.logger.warn(`[stripe] ${type} missing session id; ignoring.`)
      return
    }

    await applyPaymentEvent({ payload, logger: payload.logger }, normalized)
  }
}

export const handleCheckoutSessionCompleted = handleCheckoutSessionEvent(
  'checkout.session.completed',
)
export const handleCheckoutSessionExpired = handleCheckoutSessionEvent('checkout.session.expired')
