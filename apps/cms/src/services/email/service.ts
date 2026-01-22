import { renderEmail, getMissingPlaceholders } from '@/lib/email/renderEmail'
import { sendEmail } from '@/integrations/brevo/sendEmail'
import type { EmailLanguage, SendTemplatedEmailRequest, SendTemplatedEmailResult } from './types'

export type EmailServiceCtx = {
  payload: any
  logger?: { warn: (message: string, meta?: Record<string, unknown>) => void; info?: any; error?: any }
}

const resolveLocale = (value?: string | null): EmailLanguage => {
  return value === 'es' ? 'es' : 'en'
}

export const sendTemplatedEmail = async (
  ctx: EmailServiceCtx,
  req: SendTemplatedEmailRequest,
): Promise<SendTemplatedEmailResult> => {
  const templateResult = await ctx.payload.find({
    collection: 'emailTemplates',
    where: { slug: { equals: req.templateSlug } },
    limit: 1,
    locale: 'all',
    depth: 0,
    overrideAccess: true,
  })

  const template = templateResult.docs[0]
  if (!template) {
    ctx.logger?.warn?.('Email template not found.', { templateSlug: req.templateSlug })
    return { ok: false, reason: 'template_not_found' }
  }

  const missing = getMissingPlaceholders(template, req.params)
  if (missing.length > 0) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: template.id,
        source: 'template',
        templateSlug: req.templateSlug,
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
      template: template.id,
      source: 'template',
      templateSlug: req.templateSlug,
      toEmail: req.toEmail,
      status: 'queued',
      contact: req.contactId ?? undefined,
      lang: resolveLocale(req.locale),
    },
    overrideAccess: true,
  })

  const { subject, html, text } = await renderEmail({
    template,
    locale: resolveLocale(req.locale),
    params: req.params,
  })

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
    return { ok: true, emailSendId: order.receiptEmailSendId }
  }

  const contact = order.contact
    ? await ctx.payload.findByID({
        collection: 'contacts',
        id: order.contact,
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

  const templateLookup = await ctx.payload.find({
    collection: 'emailTemplates',
    where: { slug: { equals: 'receipt-donation' } },
    limit: 1,
    locale: 'all',
    depth: 0,
    overrideAccess: true,
  })

  const template = templateLookup.docs[0]
  const locale = resolveLocale(order.lang)

  if (!recipient) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: template?.id,
        source: template ? 'template' : 'unknown',
        templateSlug: 'receipt-donation',
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
    | 'missing_recipient'
    | 'provider_failed'
    | undefined

  if (template) {
    const missing = getMissingPlaceholders(template, params)
    if (missing.length === 0) {
      const rendered = await renderEmail({ template, locale, params })
      subject = rendered.subject
      html = rendered.html
      text = rendered.text
    } else {
      source = 'inline'
      errorCode = 'missing_placeholders'
    }
  } else {
    source = 'inline'
    errorCode = 'template_not_found'
  }

  const sendRecord = await ctx.payload.create({
    collection: 'emailSends',
    data: {
      template: template?.id,
      source,
      templateSlug: 'receipt-donation',
      toEmail: recipient,
      status: 'queued',
      contact: contact?.id,
      lang: locale,
      subject,
      ...(errorCode ? { errorCode } : {}),
    },
    overrideAccess: true,
  })

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

export const sendMembershipReceipt = async (
  ctx: EmailServiceCtx,
  args: { order: any; toEmail?: string | null; planName: string; amountUSD: number },
): Promise<SendTemplatedEmailResult> => {
  const { order, toEmail, planName, amountUSD } = args

  if (order.receiptEmailSendId) {
    return { ok: true, emailSendId: order.receiptEmailSendId }
  }

  const contact = order.contact
    ? await ctx.payload.findByID({
        collection: 'contacts',
        id: order.contact,
        overrideAccess: true,
      })
    : null

  const recipient = toEmail || contact?.email
  const amountText = `$${Number(amountUSD || 0).toFixed(2)}`
  const params = {
    name: contact?.displayName || 'Friend',
    amount: amountText,
    planName,
    emailAddress: recipient ?? '',
    publicOrderId: order.publicId,
  }

  const fallback = {
    subject: 'Membership Receipt',
    html: `Thank you for your membership purchase of ${amountText} (${planName}) with the Friends of the Seminary Hill Natural Area.`,
    text: `Thank you for your membership purchase of ${amountText} (${planName}) with the Friends of the Seminary Hill Natural Area.`,
  }

  const templateLookup = await ctx.payload.find({
    collection: 'emailTemplates',
    where: { slug: { equals: 'receipt-membership' } },
    limit: 1,
    locale: 'all',
    depth: 0,
    overrideAccess: true,
  })

  const template = templateLookup.docs[0]
  const locale = resolveLocale(order.lang)

  if (!recipient) {
    const failed = await ctx.payload.create({
      collection: 'emailSends',
      data: {
        template: template?.id,
        source: template ? 'template' : 'unknown',
        templateSlug: 'receipt-membership',
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
    | 'missing_recipient'
    | 'provider_failed'
    | undefined

  if (template) {
    const missing = getMissingPlaceholders(template, params)
    if (missing.length === 0) {
      const rendered = await renderEmail({ template, locale, params })
      subject = rendered.subject
      html = rendered.html
      text = rendered.text
    } else {
      source = 'inline'
      errorCode = 'missing_placeholders'
    }
  } else {
    source = 'inline'
    errorCode = 'template_not_found'
  }

  const sendRecord = await ctx.payload.create({
    collection: 'emailSends',
    data: {
      template: template?.id,
      source,
      templateSlug: 'receipt-membership',
      toEmail: recipient,
      status: 'queued',
      contact: contact?.id,
      lang: locale,
      subject,
      ...(errorCode ? { errorCode } : {}),
    },
    overrideAccess: true,
  })

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
