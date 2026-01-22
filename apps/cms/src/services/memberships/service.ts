import { randomUUID } from 'crypto'

import { normalizeEmail } from '@/lib/email/normalizeEmail'
import { resolveCampaignIdFromRef } from '@/services/campaigns/resolveCampaign'
import { createCheckoutSession } from '@/integrations/stripe/checkout'

import type { ServiceCtx, SubmitMembershipInput, SubmitMembershipResult } from './types'
import { ValidationError } from './types'
import { isActiveMembership, isRenewalWindowOpen } from './terms'

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
          ...(campaignId ? { campaign: campaignId } : {}),
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
      ...(campaignId ? { campaign: campaignId } : {}),
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
