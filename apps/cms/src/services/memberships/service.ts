import { randomUUID } from 'crypto'

import { normalizeEmail } from '@/lib/email/normalizeEmail'
import { resolveCampaignIdFromRef } from '@/services/campaigns/resolveCampaign'
import { createCheckoutSession } from '@/integrations/stripe/checkout'
import { sendMembershipReceipt } from '@/services/email/service'

import type {
  ServiceCtx,
  SubmitMembershipInput,
  SubmitMembershipResult,
  SubmitMembershipManualInput,
  SubmitMembershipManualResult,
  ManualPaymentMethod,
} from './types'
import { ValidationError } from './types'
import { calculateMembershipTermDates, isActiveMembership, isRenewalWindowOpen } from './terms'

const MAX_NAME_LENGTH = 200
const MAX_PHONE_LENGTH = 50
const MAX_ADDRESS_LENGTH = 500

const sanitizeOptionalText = (
  value: string | null | undefined,
  maxLength: number,
  field: string,
): string | undefined => {
  if (value === null || typeof value === 'undefined') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length > maxLength) {
    throw new ValidationError('Field exceeds maximum length.', { field, maxLength })
  }
  return trimmed
}

const resolveLocale = (value?: string | null): 'en' | 'es' => {
  return value === 'es' ? 'es' : 'en'
}

const resolvePaymentMethod = (value: unknown): ManualPaymentMethod => {
  if (value === 'cash' || value === 'check') return value
  throw new ValidationError('Invalid payment method.', { field: 'paymentMethod' })
}

const requireNonEmptyString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') {
    throw new ValidationError('Field is required.', { field })
  }
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ValidationError('Field is required.', { field })
  }
  return trimmed
}

const stripRedirectParams = (url: URL) => {
  url.searchParams.delete('publicOrderId')
  url.searchParams.delete('stripeRedirect')
  url.searchParams.delete('modal')
}

const buildSuccessUrl = (entryUrl: string, publicOrderId: string): string => {
  let url: URL
  try {
    url = new URL(entryUrl)
  } catch {
    throw new ValidationError('Invalid entryUrl.', { field: 'entryUrl' })
  }

  stripRedirectParams(url)
  url.searchParams.set('publicOrderId', publicOrderId)
  url.searchParams.set('stripeRedirect', '1')
  url.searchParams.set('modal', 'membership')
  return url.toString()
}

const buildCancelUrl = (entryUrl: string): string => {
  let url: URL
  try {
    url = new URL(entryUrl)
  } catch {
    throw new ValidationError('Invalid entryUrl.', { field: 'entryUrl' })
  }
  stripRedirectParams(url)
  return url.toString()
}

const findContactByEmail = async (payload: ServiceCtx['payload'], email: string) => {
  const result = await payload.find({
    collection: 'contacts',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

const findPlanBySlug = async (payload: ServiceCtx['payload'], slug: string) => {
  const result = await payload.find({
    collection: 'membershipPlans',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

const findLatestMembership = async (payload: ServiceCtx['payload'], contactId: string | number) => {
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

export const submitMembership = async (
  ctx: ServiceCtx,
  input: SubmitMembershipInput,
): Promise<SubmitMembershipResult> => {
  const normalizedEmail = normalizeEmail(input.email)
  if (!normalizedEmail) {
    throw new ValidationError('Email is required.', { field: 'email' })
  }

  const planSlug = requireNonEmptyString(input.planSlug, 'planSlug')
  const entryUrl = requireNonEmptyString(input.entryUrl, 'entryUrl')
  const locale = resolveLocale(input.language)
  const hasLanguage = typeof input.language === 'string' && input.language.trim().length > 0

  const plan = await findPlanBySlug(ctx.payload, planSlug)
  if (!plan) {
    throw new ValidationError('Invalid plan.', { field: 'planSlug' })
  }

  const planPrice = typeof plan.price === 'number' ? plan.price : Number(plan.price)
  const renewalWindowDays =
    typeof plan.renewalWindowDays === 'number' ? plan.renewalWindowDays : Number(plan.renewalWindowDays)

  if (!Number.isFinite(planPrice) || planPrice <= 0) {
    throw new ValidationError('Invalid plan price.', { field: 'planSlug' })
  }

  if (!Number.isFinite(renewalWindowDays) || renewalWindowDays < 0) {
    throw new ValidationError('Invalid renewal window.', { field: 'planSlug' })
  }

  const name = sanitizeOptionalText(input.name, MAX_NAME_LENGTH, 'name')
  const phone = sanitizeOptionalText(input.phone, MAX_PHONE_LENGTH, 'phone')
  const addressText = sanitizeOptionalText(input.address, MAX_ADDRESS_LENGTH, 'address')
  const checkoutName = sanitizeOptionalText(input.checkoutName, MAX_NAME_LENGTH, 'checkoutName')

  const campaignId = await resolveCampaignIdFromRef(ctx.payload, input.ref, ctx.logger)
  const resolvedCampaignId =
    typeof campaignId === 'string' ? (Number.isFinite(Number(campaignId)) ? Number(campaignId) : null) : campaignId

  const existingContact = await findContactByEmail(ctx.payload, normalizedEmail)
  const latestMembership =
    existingContact ? await findLatestMembership(ctx.payload, existingContact.id) : null

  if (latestMembership && isActiveMembership(latestMembership)) {
    const isAllowed = isRenewalWindowOpen(latestMembership, renewalWindowDays)
    if (!isAllowed) {
      throw new ValidationError('Membership renewal not allowed.', { field: 'planSlug' })
    }
  }

  const now = new Date().toISOString()

  const contact = existingContact
    ? await ctx.payload.update({
        collection: 'contacts',
        id: existingContact.id,
        data: {
          lastEngagedAt: now,
          ...(hasLanguage ? { language: locale } : {}),
          ...(name ? { name, displayName: name } : {}),
          ...(phone ? { phone } : {}),
          ...(addressText ? { address: addressText } : {}),
        },
        overrideAccess: true,
      })
    : await ctx.payload.create({
        collection: 'contacts',
        data: {
          email: normalizedEmail,
          language: locale,
          lastEngagedAt: now,
          ...(name ? { name, displayName: name } : {}),
          ...(phone ? { phone } : {}),
          ...(addressText ? { address: addressText } : {}),
          ...(resolvedCampaignId ? { campaign: resolvedCampaignId } : {}),
        },
        overrideAccess: true,
      })

  const publicId = randomUUID()

  const order = await ctx.payload.create({
    collection: 'orders',
    data: {
      publicId,
      status: 'created',
      contact: contact.id,
      ...(resolvedCampaignId ? { campaign: resolvedCampaignId } : {}),
      lang: locale,
      totalUSD: planPrice,
    },
    overrideAccess: true,
  })

  await ctx.payload.create({
    collection: 'orderItems',
    data: {
      order: order.id,
      itemType: 'membership',
      label: `Membership: ${plan.name ?? planSlug}`,
      qty: 1,
      unitAmountUSD: planPrice,
      totalUSD: planPrice,
    },
    overrideAccess: true,
  })

  const successUrl = buildSuccessUrl(entryUrl, publicId)
  const cancelUrl = buildCancelUrl(entryUrl)
  const session = await createCheckoutSession({
    amountCents: Math.round(planPrice * 100),
    email: normalizedEmail,
    successUrl,
    cancelUrl,
    locale,
    name: checkoutName || `Membership: ${plan.name ?? planSlug}`,
    metadata: {
      publicOrderId: publicId,
      orderId: String(order.id),
      planSlug,
      planId: String(plan.id),
    },
  })

  if (!session.url) {
    throw new Error('Stripe Checkout session missing URL.')
  }

  await ctx.payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      stripeCheckoutSessionId: session.id,
    },
    overrideAccess: true,
  })

  return {
    ok: true,
    url: session.url,
    publicOrderId: publicId,
  }
}

export const submitMembershipManual = async (
  ctx: ServiceCtx,
  input: SubmitMembershipManualInput,
): Promise<SubmitMembershipManualResult> => {
  const normalizedEmail = normalizeEmail(input.email)
  if (!normalizedEmail) {
    throw new ValidationError('Email is required.', { field: 'email' })
  }

  const planSlug = requireNonEmptyString(input.planSlug, 'planSlug')
  const name = requireNonEmptyString(input.name, 'name')
  if (name.length > MAX_NAME_LENGTH) {
    throw new ValidationError('Field exceeds maximum length.', { field: 'name', maxLength: MAX_NAME_LENGTH })
  }

  const locale = resolveLocale(input.locale)
  const paymentMethod = resolvePaymentMethod(input.paymentMethod)

  const plan = await findPlanBySlug(ctx.payload, planSlug)
  if (!plan) {
    throw new ValidationError('Invalid plan.', { field: 'planSlug' })
  }

  const planPrice = typeof plan.price === 'number' ? plan.price : Number(plan.price)
  const renewalWindowDays =
    typeof plan.renewalWindowDays === 'number' ? plan.renewalWindowDays : Number(plan.renewalWindowDays)

  if (!Number.isFinite(planPrice) || planPrice <= 0) {
    throw new ValidationError('Invalid plan price.', { field: 'planSlug' })
  }

  if (!Number.isFinite(renewalWindowDays) || renewalWindowDays < 0) {
    throw new ValidationError('Invalid renewal window.', { field: 'planSlug' })
  }

  const existingContact = await findContactByEmail(ctx.payload, normalizedEmail)
  const latestMembership =
    existingContact ? await findLatestMembership(ctx.payload, existingContact.id) : null

  if (
    latestMembership &&
    (isActiveMembership(latestMembership) || isRenewalWindowOpen(latestMembership, renewalWindowDays))
  ) {
    throw new ValidationError('Membership renewal not allowed.', { field: 'planSlug' })
  }

  const now = new Date().toISOString()
  const contact = existingContact
    ? await ctx.payload.update({
        collection: 'contacts',
        id: existingContact.id,
        data: {
          lastEngagedAt: now,
          language: locale,
          name,
          displayName: name,
        },
        overrideAccess: true,
      })
    : await ctx.payload.create({
        collection: 'contacts',
        data: {
          email: normalizedEmail,
          language: locale,
          lastEngagedAt: now,
          name,
          displayName: name,
        },
        overrideAccess: true,
      })

  const publicId = randomUUID()

  const order = await ctx.payload.create({
    collection: 'orders',
    data: {
      publicId,
      status: 'paid',
      contact: contact.id,
      lang: locale,
      totalUSD: planPrice,
    },
    overrideAccess: true,
  })

  await ctx.payload.create({
    collection: 'orderItems',
    data: {
      order: order.id,
      itemType: 'membership',
      label: `Membership: ${plan.name ?? planSlug}`,
      qty: 1,
      unitAmountUSD: planPrice,
      totalUSD: planPrice,
    },
    overrideAccess: true,
  })

  const { startISO, endISO } = calculateMembershipTermDates(new Date(), latestMembership, renewalWindowDays)
  const membership = await ctx.payload.create({
    collection: 'memberships',
    data: {
      contact: contact.id,
      plan: plan.id,
      startDay: startISO,
      endDay: endISO,
    },
    overrideAccess: true,
  })

  let membershipEndDay = membership?.endDay ?? null
  if (!membershipEndDay && membership?.id) {
    const persisted = await ctx.payload.findByID({
      collection: 'memberships',
      id: membership.id,
      overrideAccess: true,
    })
    membershipEndDay = persisted?.endDay ?? null
  }

  await ctx.payload.create({
    collection: 'transactions',
    data: {
      order: order.id,
      contact: contact.id,
      amountUSD: planPrice,
      paymentType: paymentMethod,
    },
    overrideAccess: true,
  })

  await sendMembershipReceipt(ctx, {
    order,
    toEmail: normalizedEmail,
    planName: plan.name ?? plan.slug ?? 'Membership',
    amountUSD: planPrice,
    membershipEndDay,
  })

  return {
    ok: true,
    publicOrderId: publicId,
    orderId: String(order.id),
    membershipId: membership?.id ? String(membership.id) : undefined,
  }
}
