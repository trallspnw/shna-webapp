import { randomUUID } from 'crypto'

import { normalizeEmail } from '@/lib/email/normalizeEmail'
import { resolveCampaignIdFromRef } from '@/services/campaigns/resolveCampaign'
import { createCheckoutSession } from '@/integrations/stripe/checkout'
import { sendDonationReceipt } from '@/services/email/service'

import type {
  ServiceCtx,
  SubmitDonationInput,
  SubmitDonationResult,
  OrderStatusInput,
  OrderStatusResult,
  SubmitDonationManualInput,
  SubmitDonationManualResult,
  ManualPaymentMethod,
} from './types'
import { ValidationError } from './types'
import { parseAmountUSD, enforceMaxDonationUSD } from './amount'

const MAX_NAME_LENGTH = 200
const MAX_PHONE_LENGTH = 50
const MAX_ADDRESS_LENGTH = 500

const isUuidLike = (value: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

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

const resolveLocale = (value: string): 'en' | 'es' => {
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
  url.searchParams.set('modal', 'donation')
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

const getMaxDonationUSD = async (payload: ServiceCtx['payload']): Promise<number> => {
  const global = await payload.findGlobal({
    slug: 'donations-settings',
    depth: 0,
  })

  const configured = (global as { maxDonationUSD?: number } | null)?.maxDonationUSD
  if (typeof configured === 'number' && Number.isFinite(configured)) {
    return configured
  }
  return 10000
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

export const submitDonation = async (
  ctx: ServiceCtx,
  input: SubmitDonationInput,
): Promise<SubmitDonationResult> => {
  const normalizedEmail = normalizeEmail(input.email)
  if (!normalizedEmail) {
    throw new ValidationError('Email is required.', { field: 'email' })
  }

  const entryUrl = requireNonEmptyString(input.entryUrl, 'entryUrl')
  const rawLang = requireNonEmptyString(input.lang, 'lang')
  const locale = resolveLocale(rawLang)

  const parsed = parseAmountUSD(input.amountUSD)
  const maxDonationUSD = await getMaxDonationUSD(ctx.payload)
  enforceMaxDonationUSD(parsed.amountUSD, maxDonationUSD)

  const name = sanitizeOptionalText(input.name, MAX_NAME_LENGTH, 'name')
  const phone = sanitizeOptionalText(input.phone, MAX_PHONE_LENGTH, 'phone')
  const addressText = sanitizeOptionalText(input.addressText, MAX_ADDRESS_LENGTH, 'addressText')
  const checkoutName = sanitizeOptionalText(input.checkoutName, MAX_NAME_LENGTH, 'checkoutName')

  const campaignId = await resolveCampaignIdFromRef(ctx.payload, input.ref, ctx.logger)
  const resolvedCampaignId =
    typeof campaignId === 'string' ? (Number.isFinite(Number(campaignId)) ? Number(campaignId) : null) : campaignId

  const now = new Date().toISOString()
  const existingContact = await findContactByEmail(ctx.payload, normalizedEmail)

  const contact = existingContact
    ? await ctx.payload.update({
        collection: 'contacts',
        id: existingContact.id,
        data: {
          lastEngagedAt: now,
          language: locale,
          ...(name ? { name, displayName: name } : {}),
          ...(phone ? { phone } : {}),
          ...(addressText ? { address: addressText } : {}),
          ...(resolvedCampaignId && !existingContact.campaign ? { campaign: resolvedCampaignId } : {}),
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
      totalUSD: parsed.amountUSD,
    },
    overrideAccess: true,
  })

  await ctx.payload.create({
    collection: 'orderItems',
    data: {
      order: order.id,
      itemType: 'donation',
      label: 'Donation',
      qty: 1,
      unitAmountUSD: parsed.amountUSD,
      totalUSD: parsed.amountUSD,
    },
    overrideAccess: true,
  })

  const successUrl = buildSuccessUrl(entryUrl, publicId)
  const cancelUrl = buildCancelUrl(entryUrl)
  const session = await createCheckoutSession({
    amountCents: parsed.amountCents,
    email: normalizedEmail,
    successUrl,
    cancelUrl,
    locale,
    name: checkoutName || 'Donation',
    metadata: {
      publicOrderId: publicId,
      orderId: String(order.id),
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

export const submitDonationManual = async (
  ctx: ServiceCtx,
  input: SubmitDonationManualInput,
): Promise<SubmitDonationManualResult> => {
  const normalizedEmail = normalizeEmail(input.email)
  if (!normalizedEmail) {
    throw new ValidationError('Email is required.', { field: 'email' })
  }

  const locale = resolveLocale(input.locale || 'en')
  const paymentMethod = resolvePaymentMethod(input.paymentMethod)

  const parsed = parseAmountUSD(input.amountUSD)
  const maxDonationUSD = await getMaxDonationUSD(ctx.payload)
  enforceMaxDonationUSD(parsed.amountUSD, maxDonationUSD)

  const name = sanitizeOptionalText(input.name, MAX_NAME_LENGTH, 'name')
  const now = new Date().toISOString()
  const existingContact = await findContactByEmail(ctx.payload, normalizedEmail)

  const contact = existingContact
    ? await ctx.payload.update({
        collection: 'contacts',
        id: existingContact.id,
        data: {
          lastEngagedAt: now,
          language: locale,
          ...(name ? { name, displayName: name } : {}),
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
      totalUSD: parsed.amountUSD,
    },
    overrideAccess: true,
  })

  await ctx.payload.create({
    collection: 'orderItems',
    data: {
      order: order.id,
      itemType: 'donation',
      label: 'Donation',
      qty: 1,
      unitAmountUSD: parsed.amountUSD,
      totalUSD: parsed.amountUSD,
    },
    overrideAccess: true,
  })

  await ctx.payload.create({
    collection: 'transactions',
    data: {
      order: order.id,
      contact: contact.id,
      amountUSD: parsed.amountUSD,
      paymentType: paymentMethod,
    },
    overrideAccess: true,
  })

  await sendDonationReceipt(ctx, {
    order,
    toEmail: normalizedEmail,
  })

  return {
    ok: true,
    publicOrderId: publicId,
    orderId: String(order.id),
  }
}

export const getOrderStatus = async (
  ctx: ServiceCtx,
  input: OrderStatusInput,
): Promise<OrderStatusResult> => {
  const publicOrderId = requireNonEmptyString(input.publicOrderId, 'publicOrderId')
  if (!isUuidLike(publicOrderId)) {
    throw new ValidationError('Invalid publicOrderId.', { field: 'publicOrderId' })
  }

  const result = await ctx.payload.find({
    collection: 'orders',
    where: { publicId: { equals: publicOrderId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const order = result.docs[0]
  if (!order) {
    throw new ValidationError('Order not found.', { field: 'publicOrderId' })
  }

  const status = order.status as OrderStatusResult['status']
  const terminal = status === 'paid' || status === 'expired' || status === 'error'

  return {
    ok: true,
    status,
    terminal,
    totalUSD: order.totalUSD as number,
  }
}
