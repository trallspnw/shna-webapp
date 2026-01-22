import type { StripeCheckoutSessionEvent } from '@/integrations/stripe/types'
import { sendDonationReceipt } from '@/services/email/service'
import { handleMembershipCheckoutCompleted } from '@/services/memberships/webhook'

export type OrdersServiceCtx = {
  payload: any
  logger?: { warn: (message: string, meta?: Record<string, unknown>) => void; info?: any; error?: any }
}

const findOrderBySessionId = async (payload: any, sessionId: string) => {
  const result = await payload.find({
    collection: 'orders',
    where: { stripeCheckoutSessionId: { equals: sessionId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

const getOrderItems = async (payload: any, orderId: string | number) => {
  return payload.find({
    collection: 'orderItems',
    where: {
      order: { equals: orderId },
    },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
}

const ensureTransaction = async (
  payload: any,
  order: any,
  checkoutSessionId: string,
): Promise<void> => {
  const baseWhere: Record<string, unknown> = {
    and: [
      { order: { equals: order.id } },
      { paymentType: { equals: 'stripe' } },
    ],
  }

  const existing = await payload.find({
    collection: 'transactions',
    where: baseWhere,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const current = existing.docs[0]
    if (!current.stripeRefId) {
      await payload.update({
        collection: 'transactions',
        id: current.id,
        data: { stripeRefId: checkoutSessionId },
        overrideAccess: true,
      })
    }
    return
  }

  await payload.create({
    collection: 'transactions',
    data: {
      order: order.id,
      contact: order.contact ?? undefined,
      amountUSD: order.totalUSD,
      paymentType: 'stripe',
      stripeRefId: checkoutSessionId,
    },
    overrideAccess: true,
  })
}

export const applyPaymentEvent = async (
  ctx: OrdersServiceCtx,
  evt: StripeCheckoutSessionEvent,
): Promise<void> => {
  const { payload, logger } = ctx
  const sessionId = evt.session.sessionId

  const order = await findOrderBySessionId(payload, sessionId)
  if (!order) {
    logger?.warn?.('[stripe] Order not found for session.', { sessionId })
    return
  }

  if (evt.type === 'checkout.session.expired') {
    if (order.status === 'paid') {
      logger?.info?.('[stripe] Order already paid; skipping expire.', { orderId: order.id })
      return
    }

    if (order.status !== 'expired') {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'expired' },
        overrideAccess: true,
      })
    }

    return
  }

  if (evt.type === 'checkout.session.completed') {
    const itemsResult = await getOrderItems(payload, order.id)
    const items = itemsResult.docs ?? []
    const hasDonationItem = items.some((item: any) => item?.itemType === 'donation')
    const hasMembershipItem = items.some((item: any) => item?.itemType === 'membership')

    if (order.status === 'paid') {
      logger?.info?.('[stripe] Order already paid; skipping.', { orderId: order.id })
    } else {
      if (hasMembershipItem) {
        await handleMembershipCheckoutCompleted(ctx, { order, session: evt.session })
      } else {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'paid',
            stripePaymentIntentId: evt.session.paymentIntentId ?? undefined,
          },
          overrideAccess: true,
        })
      }
    }

    await ensureTransaction(payload, order, sessionId)

    if (hasDonationItem) {
      await sendDonationReceipt(ctx, {
        order,
        toEmail: evt.session.customerEmail ?? undefined,
      })
    } else if (!hasMembershipItem) {
      logger?.info?.('[stripe] Order contains no donation items; skipping receipt.', { orderId: order.id })
    }
  }
}
