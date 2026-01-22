import { calculateMembershipTermDates } from './terms'
import { sendMembershipReceipt } from '@/services/email/service'

export type MembershipWebhookCtx = {
  payload: any
  logger?: { warn: (message: string, meta?: Record<string, unknown>) => void; info?: any; error?: any }
}

const findPlanById = async (payload: any, id: string | number) => {
  try {
    return await payload.findByID({
      collection: 'membershipPlans',
      id,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return null
  }
}

const findPlanBySlug = async (payload: any, slug: string) => {
  const result = await payload.find({
    collection: 'membershipPlans',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

const resolvePlan = async (payload: any, metadata?: Record<string, unknown> | null) => {
  const planId = metadata?.planId
  if (typeof planId === 'string' || typeof planId === 'number') {
    const plan = await findPlanById(payload, planId)
    if (plan) return plan
  }

  const planSlug = metadata?.planSlug
  if (typeof planSlug === 'string') {
    const plan = await findPlanBySlug(payload, planSlug)
    if (plan) return plan
  }

  return null
}

const findLatestMembership = async (payload: any, contactId: string | number) => {
  const result = await payload.find({
    collection: 'memberships',
    where: { contact: { equals: contactId } },
    sort: '-endDay',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

export const handleMembershipCheckoutCompleted = async (
  ctx: MembershipWebhookCtx,
  args: {
    order: any
    session: { paymentIntentId?: string | null; customerEmail?: string | null; metadata?: Record<string, unknown> | null }
  },
): Promise<boolean> => {
  const { payload, logger } = ctx
  const { order, session } = args

  if (!order?.contact) {
    logger?.warn?.('[stripe] Membership order missing contact; skipping membership creation.', {
      orderId: order?.id,
    })
    return false
  }

  const plan = await resolvePlan(payload, session.metadata ?? null)
  if (!plan) {
    logger?.warn?.('[stripe] Membership plan not found for order.', { orderId: order?.id })
    return false
  }

  const planPrice = typeof plan.price === 'number' ? plan.price : Number(plan.price)
  const renewalWindowDays =
    typeof plan.renewalWindowDays === 'number' ? plan.renewalWindowDays : Number(plan.renewalWindowDays)

  if (!Number.isFinite(planPrice) || planPrice <= 0) {
    logger?.warn?.('[stripe] Membership plan has invalid price; skipping receipt.', { planId: plan.id })
  }

  if (!Number.isFinite(renewalWindowDays) || renewalWindowDays < 0) {
    logger?.warn?.('[stripe] Membership plan has invalid renewal window; skipping membership creation.', {
      planId: plan.id,
    })
    return false
  }

  const latestMembership = await findLatestMembership(payload, order.contact)
  const now = new Date()
  const { startISO, endISO } = calculateMembershipTermDates(now, latestMembership, renewalWindowDays)

  await payload.create({
    collection: 'memberships',
    data: {
      contact: order.contact,
      plan: plan.id,
      startDay: startISO,
      endDay: endISO,
      ...(order.campaign ? { campaign: order.campaign } : {}),
    },
    overrideAccess: true,
  })

  await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      status: 'paid',
      stripePaymentIntentId: session.paymentIntentId ?? undefined,
    },
    overrideAccess: true,
  })

  if (Number.isFinite(planPrice) && planPrice > 0) {
    await sendMembershipReceipt(ctx, {
      order,
      toEmail: session.customerEmail ?? undefined,
      planName: plan.name ?? plan.slug ?? 'Membership',
      amountUSD: planPrice,
    })
  }

  return true
}
