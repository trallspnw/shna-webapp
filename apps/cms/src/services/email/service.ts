import { renderEmail, computeMissingPlaceholders } from '@/lib/email/renderEmail'
import { sendEmail } from '@/integrations/brevo/sendEmail'
import type { EmailLanguage, SendTemplatedEmailRequest, SendTemplatedEmailResult } from './types'
import {
  redactParamsForDiagnostics,
  resolveTemplateOrNull,
} from './diagnostics'

export type EmailServiceCtx = {
  payload: any
  logger?: { warn: (message: string, meta?: Record<string, unknown>) => void; info?: any; error?: any }
}

const resolveLocale = (value?: string | null): EmailLanguage => {
  return value === 'es' ? 'es' : 'en'
}

const buildPlaceholderSnapshot = (params: Record<string, unknown>) =>
  redactParamsForDiagnostics(params)

const logTemplateFallback = (
  ctx: EmailServiceCtx,
  meta: {
    emailType: string
    templateSlug: string
    fallbackReason: string
    missingPlaceholders?: string[]
    orderId?: string | number
    publicOrderId?: string
    emailSendId?: string | number
  },
) => {
  ctx.logger?.warn?.('[email] template fallback', {
    emailType: meta.emailType,
    templateSlug: meta.templateSlug,
    fallbackReason: meta.fallbackReason,
    missingPlaceholders: meta.missingPlaceholders ?? [],
    orderId: meta.orderId,
    publicOrderId: meta.publicOrderId,
    emailSendId: meta.emailSendId,
  })
}

export const sendTemplatedEmail = async (
  ctx: EmailServiceCtx,
  req: SendTemplatedEmailRequest,
): Promise<SendTemplatedEmailResult> => {
  const { template, templateId, inactive } = await resolveTemplateOrNull(
    ctx.payload,
    req.templateSlug,
  )
  const snapshot = buildPlaceholderSnapshot(req.params)

  if (!template) {
    ctx.logger?.warn?.('[email] template not found', { templateSlug: req.templateSlug })
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        templateSlug: req.templateSlug,
        templateAttempted: true,
        templateUsed: false,
        fallbackReason: 'template_not_found',
        missingPlaceholders: [],
        placeholderSnapshot: snapshot,
        source: 'unknown',
        toEmail: req.toEmail,
        status: 'failed',
        contact: req.contactId ?? undefined,
        lang: resolveLocale(req.locale),
        subject: 'Template not found',
        errorCode: 'template_not_found',
      },
      overrideAccess: true,
    })
    return { ok: false, reason: 'template_not_found', emailSendId: failed.id }
  }

  if (inactive) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: templateId ?? undefined,
        templateSlug: req.templateSlug,
        templateAttempted: true,
        templateUsed: false,
        fallbackReason: 'template_inactive',
        missingPlaceholders: [],
        placeholderSnapshot: snapshot,
        source: 'template',
        toEmail: req.toEmail,
        status: 'failed',
        contact: req.contactId ?? undefined,
        lang: resolveLocale(req.locale),
        subject: 'Template inactive',
        errorCode: 'template_inactive',
      },
      overrideAccess: true,
    })
    return { ok: false, reason: 'template_inactive', emailSendId: failed.id }
  }

  const missing = computeMissingPlaceholders(template, req.params)
  if (missing.length > 0) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: templateId ?? undefined,
        source: 'template',
        templateSlug: req.templateSlug,
        templateAttempted: true,
        templateUsed: false,
        fallbackReason: 'missing_placeholders',
        missingPlaceholders: missing,
        placeholderSnapshot: snapshot,
        toEmail: req.toEmail,
        status: 'failed',
        contact: req.contactId ?? undefined,
        lang: resolveLocale(req.locale),
        subject: 'Missing placeholders',
        errorCode: 'missing_placeholders',
        error: `Missing placeholders: ${missing.join(', ')}`,
      },
      overrideAccess: true,
    })

    return { ok: false, reason: 'missing_placeholders', emailSendId: failed.id }
  }

  const sendRecord = await ctx.payload.create({
    collection: 'emailSends',
    data: {
      template: templateId ?? undefined,
      source: 'template',
      templateSlug: req.templateSlug,
      templateAttempted: true,
      templateUsed: true,
      fallbackReason: null,
      missingPlaceholders: [],
      placeholderSnapshot: snapshot,
      toEmail: req.toEmail,
      status: 'queued',
      contact: req.contactId ?? undefined,
      lang: resolveLocale(req.locale),
    },
    overrideAccess: true,
  })

  let subject = ''
  let html = ''
  let text = ''
  try {
    const rendered = await renderEmail({
      template,
      locale: resolveLocale(req.locale),
      params: req.params,
    })
    subject = rendered.subject
    html = rendered.html
    text = rendered.text
  } catch (error) {
    await ctx.payload.update({
      collection: 'emailSends',
      id: sendRecord.id,
      data: {
        status: 'failed',
        errorCode: 'render_error',
        error: 'Template render error.',
        fallbackReason: 'render_error',
        templateUsed: false,
      },
      overrideAccess: true,
    })
    return { ok: false, reason: 'render_error', emailSendId: sendRecord.id }
  }

  const providerResult = await sendEmail({
    to: req.toEmail,
    subject,
    html,
    text,
  })

  if (!providerResult.ok) {
    await ctx.payload.update({
      collection: 'emailSends',
      id: sendRecord.id,
      data: {
        status: 'failed',
        errorCode: 'provider_failed',
        error: 'Provider error.',
      },
      overrideAccess: true,
    })

    return { ok: false, reason: 'provider_failed', emailSendId: sendRecord.id }
  }

  await ctx.payload.update({
    collection: 'emailSends',
    id: sendRecord.id,
    data: {
      status: 'sent',
      providerMessageId: providerResult.messageId,
      sentAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  return { ok: true, emailSendId: sendRecord.id }
}

export const sendDonationReceipt = async (
  ctx: EmailServiceCtx,
  args: { order: any; toEmail?: string | null },
): Promise<SendTemplatedEmailResult> => {
  const { order, toEmail } = args

  if (order.receiptEmailSendId) {
    logTemplateFallback(ctx, {
      emailType: 'donation_receipt',
      templateSlug: 'receipt-donation',
      fallbackReason: 'skipped_already_sent',
      orderId: order.id,
      publicOrderId: order.publicId,
      emailSendId: order.receiptEmailSendId,
    })
    return { ok: true, emailSendId: order.receiptEmailSendId }
  }

  const contactId =
    order.contact && typeof order.contact === 'object' ? order.contact.id : order.contact
  const contact = contactId
    ? await ctx.payload.findByID({
        collection: 'contacts',
        id: contactId,
        overrideAccess: true,
      })
    : null

  const recipient = toEmail || contact?.email
  const params = {
    name: contact?.displayName || 'Friend',
    amount: `$${Number(order.totalUSD || 0).toFixed(2)}`,
    publicOrderId: order.publicId,
  }

  const fallback = {
    subject: 'Donation Receipt',
    html: `Thank you for your donation of ${params.amount} to the Friends of the Seminary Hill Natural Area. We appreciate your support.`,
    text: `Thank you for your donation of ${params.amount} to the Friends of the Seminary Hill Natural Area. We appreciate your support.`,
  }

  const { template, templateId, inactive } = await resolveTemplateOrNull(
    ctx.payload,
    'receipt-donation',
  )
  const locale = resolveLocale(order.lang)
  const snapshot = buildPlaceholderSnapshot(params)

  if (!recipient) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: templateId ?? undefined,
        source: template ? 'template' : 'unknown',
        templateSlug: 'receipt-donation',
        templateAttempted: true,
        templateUsed: false,
        fallbackReason: null,
        missingPlaceholders: [],
        placeholderSnapshot: snapshot,
        toEmail: 'unknown',
        status: 'failed',
        contact: contact?.id,
        lang: locale,
        subject: template ? 'Missing recipient' : fallback.subject,
        errorCode: 'missing_recipient',
        error: 'Missing recipient email.',
      },
      overrideAccess: true,
    })

    await ctx.payload.update({
      collection: 'orders',
      id: order.id,
      data: { receiptEmailSendId: String(failed.id) },
      overrideAccess: true,
    })

    return { ok: false, reason: 'missing_recipient', emailSendId: failed.id }
  }

  let subject = fallback.subject
  let html = fallback.html
  let text = fallback.text
  let source: 'template' | 'inline' | 'unknown' = template ? 'template' : 'inline'
  let errorCode:
    | 'missing_placeholders'
    | 'template_not_found'
    | 'template_inactive'
    | 'render_error'
    | 'missing_recipient'
    | 'provider_failed'
    | undefined
  let fallbackReason:
    | 'template_not_found'
    | 'template_inactive'
    | 'missing_placeholders'
    | 'render_error'
    | null = null
  let missingPlaceholders: string[] = []
  let templateUsed = false

  if (!template) {
    source = 'inline'
    errorCode = 'template_not_found'
    fallbackReason = 'template_not_found'
  } else if (inactive) {
    source = 'inline'
    errorCode = 'template_inactive'
    fallbackReason = 'template_inactive'
  } else {
    const missing = computeMissingPlaceholders(template, params)
    if (missing.length === 0) {
      try {
        const rendered = await renderEmail({ template, locale, params })
        subject = rendered.subject
        html = rendered.html
        text = rendered.text
        templateUsed = true
      } catch {
        source = 'inline'
        errorCode = 'render_error'
        fallbackReason = 'render_error'
      }
    } else {
      source = 'inline'
      errorCode = 'missing_placeholders'
      fallbackReason = 'missing_placeholders'
      missingPlaceholders = missing
    }
  }

  const sendRecord = await ctx.payload.create({
    collection: 'emailSends',
    data: {
      template: templateId ?? undefined,
      source,
      templateSlug: 'receipt-donation',
      templateAttempted: true,
      templateUsed,
      fallbackReason,
      missingPlaceholders,
      placeholderSnapshot: snapshot,
      toEmail: recipient,
      status: 'queued',
      contact: contact?.id,
      lang: locale,
      subject,
      ...(errorCode ? { errorCode } : {}),
    },
    overrideAccess: true,
  })

  if (fallbackReason) {
    logTemplateFallback(ctx, {
      emailType: 'donation_receipt',
      templateSlug: 'receipt-donation',
      fallbackReason,
      missingPlaceholders,
      orderId: order.id,
      publicOrderId: order.publicId,
      emailSendId: sendRecord.id,
    })
  }

  const providerResult = await sendEmail({
    to: recipient,
    subject,
    html,
    text,
  })

  if (!providerResult.ok) {
    await ctx.payload.update({
      collection: 'emailSends',
      id: sendRecord.id,
      data: {
        status: 'failed',
        errorCode: 'provider_failed',
        error: 'Provider error.',
      },
      overrideAccess: true,
    })
  } else {
    await ctx.payload.update({
      collection: 'emailSends',
      id: sendRecord.id,
      data: {
        status: 'sent',
        providerMessageId: providerResult.messageId,
        sentAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  }

  if (order?.id) {
    try {
      await ctx.payload.update({
        collection: 'orders',
        id: order.id,
        data: { receiptEmailSendId: String(sendRecord.id) },
        overrideAccess: true,
      })
    } catch (error) {
      ctx.logger?.warn?.('[email] failed to update order receiptEmailSendId', {
        orderId: order?.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return {
    ok: providerResult.ok,
    emailSendId: sendRecord.id,
    reason: providerResult.ok ? undefined : 'provider_failed',
  }
}

export const sendMembershipReceipt = async (
  ctx: EmailServiceCtx,
  args: {
    order: any
    toEmail?: string | null
    planName: string
    amountUSD: number
    membershipEndDay?: string | null
  },
): Promise<SendTemplatedEmailResult> => {
  const { order, toEmail, planName, amountUSD, membershipEndDay } = args

  if (order.receiptEmailSendId) {
    logTemplateFallback(ctx, {
      emailType: 'membership_receipt',
      templateSlug: 'receipt-membership',
      fallbackReason: 'skipped_already_sent',
      orderId: order.id,
      publicOrderId: order.publicId,
      emailSendId: order.receiptEmailSendId,
    })
    return { ok: true, emailSendId: order.receiptEmailSendId }
  }

  const contactId =
    order.contact && typeof order.contact === 'object' ? order.contact.id : order.contact
  const contact = contactId
    ? await ctx.payload.findByID({
        collection: 'contacts',
        id: contactId,
        overrideAccess: true,
      })
    : null

  const recipient = toEmail || contact?.email
  const amountText = `$${Number(amountUSD || 0).toFixed(2)}`
  const contactLocale = resolveLocale(contact?.language)
  const expirationText = (() => {
    if (!membershipEndDay) return ''
    const date = new Date(membershipEndDay)
    if (Number.isNaN(date.getTime())) return ''
    const formatLocale = contactLocale === 'es' ? 'es-US' : 'en-US'
    try {
      return new Intl.DateTimeFormat(formatLocale, { dateStyle: 'long' }).format(date)
    } catch {
      return date.toISOString().slice(0, 10)
    }
  })()
  const params = {
    name: contact?.displayName || 'Friend',
    amount: amountText,
    planName,
    emailAddress: recipient ?? '',
    publicOrderId: order.publicId,
    membershipExpiresOn: expirationText,
  }

  const fallback = {
    subject: 'Membership Receipt',
    html: `Thank you for your membership purchase of ${amountText} (${planName}) with the Friends of the Seminary Hill Natural Area.`,
    text: `Thank you for your membership purchase of ${amountText} (${planName}) with the Friends of the Seminary Hill Natural Area.`,
  }

  const { template, templateId, inactive } = await resolveTemplateOrNull(
    ctx.payload,
    'receipt-membership',
  )
  const locale = resolveLocale(order.lang)
  const snapshot = buildPlaceholderSnapshot(params)

  if (template) {
    const hasPlaceholder = (template.placeholders || []).some(
      (entry: { key?: string | null }) => entry?.key === 'membershipExpiresOn',
    )
    if (!hasPlaceholder) {
      try {
        await ctx.payload.update({
          collection: 'emailTemplates',
          id: templateId,
          data: {
            placeholders: [
              ...(template.placeholders || []),
              {
                key: 'membershipExpiresOn',
                description: 'Membership expiration date (formatted)',
              },
            ],
          },
          overrideAccess: true,
        })
      } catch (error) {
        ctx.logger?.warn?.('[email] failed to append membershipExpiresOn placeholder', {
          error,
          templateId,
        })
      }
    }
  }

  if (!recipient) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: templateId ?? undefined,
        templateId: templateId ? String(templateId) : undefined,
        source: template ? 'template' : 'unknown',
        templateSlug: 'receipt-membership',
        templateAttempted: true,
        templateUsed: false,
        fallbackReason: null,
        missingPlaceholders: [],
        placeholderSnapshot: snapshot,
        toEmail: 'unknown',
        status: 'failed',
        contact: contact?.id,
        lang: locale,
        subject: template ? 'Missing recipient' : fallback.subject,
        errorCode: 'missing_recipient',
        error: 'Missing recipient email.',
      },
      overrideAccess: true,
    })

    await ctx.payload.update({
      collection: 'orders',
      id: order.id,
      data: { receiptEmailSendId: String(failed.id) },
      overrideAccess: true,
    })

    return { ok: false, reason: 'missing_recipient', emailSendId: failed.id }
  }

  let subject = fallback.subject
  let html = fallback.html
  let text = fallback.text
  let source: 'template' | 'inline' | 'unknown' = template ? 'template' : 'inline'
  let errorCode:
    | 'missing_placeholders'
    | 'template_not_found'
    | 'template_inactive'
    | 'render_error'
    | 'missing_recipient'
    | 'provider_failed'
    | undefined
  let fallbackReason:
    | 'template_not_found'
    | 'template_inactive'
    | 'missing_placeholders'
    | 'render_error'
    | null = null
  let missingPlaceholders: string[] = []
  let templateUsed = false

  if (!template) {
    source = 'inline'
    errorCode = 'template_not_found'
    fallbackReason = 'template_not_found'
  } else if (inactive) {
    source = 'inline'
    errorCode = 'template_inactive'
    fallbackReason = 'template_inactive'
  } else {
    const missing = computeMissingPlaceholders(template, params)
    if (missing.length === 0) {
      try {
        const rendered = await renderEmail({ template, locale, params })
        subject = rendered.subject
        html = rendered.html
        text = rendered.text
        templateUsed = true
      } catch {
        source = 'inline'
        errorCode = 'render_error'
        fallbackReason = 'render_error'
      }
    } else {
      ctx.logger?.warn?.('[email] membership receipt placeholders missing', {
        templateSlug: 'receipt-membership',
        templatePlaceholders: (template.placeholders || [])
          .map((entry: { key?: string | null }) => entry?.key)
          .filter(Boolean),
        paramsKeys: Object.keys(params),
        missingPlaceholders: missing,
      })
      source = 'inline'
      errorCode = 'missing_placeholders'
      fallbackReason = 'missing_placeholders'
      missingPlaceholders = missing
    }
  }

  const sendRecord = await ctx.payload.create({
    collection: 'emailSends',
    data: {
      template: templateId ?? undefined,
      source,
      templateSlug: 'receipt-membership',
      templateAttempted: true,
      templateUsed,
      fallbackReason,
      missingPlaceholders,
      placeholderSnapshot: snapshot,
      toEmail: recipient,
      status: 'queued',
      contact: contact?.id,
      lang: locale,
      subject,
      ...(errorCode ? { errorCode } : {}),
    },
    overrideAccess: true,
  })

  if (fallbackReason) {
    logTemplateFallback(ctx, {
      emailType: 'membership_receipt',
      templateSlug: 'receipt-membership',
      fallbackReason,
      missingPlaceholders,
      orderId: order.id,
      publicOrderId: order.publicId,
      emailSendId: sendRecord.id,
    })
  }

  const providerResult = await sendEmail({
    to: recipient,
    subject,
    html,
    text,
  })

  if (!providerResult.ok) {
    await ctx.payload.update({
      collection: 'emailSends',
      id: sendRecord.id,
      data: {
        status: 'failed',
        errorCode: 'provider_failed',
        error: 'Provider error.',
      },
      overrideAccess: true,
    })
  } else {
    await ctx.payload.update({
      collection: 'emailSends',
      id: sendRecord.id,
      data: {
        status: 'sent',
        providerMessageId: providerResult.messageId,
        sentAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })
  }

  await ctx.payload.update({
    collection: 'orders',
    id: order.id,
    data: { receiptEmailSendId: String(sendRecord.id) },
    overrideAccess: true,
  })

  return {
    ok: providerResult.ok,
    emailSendId: sendRecord.id,
    reason: providerResult.ok ? undefined : 'provider_failed',
  }
}
