import { describe, it, expect, vi, beforeEach } from 'vitest'

import { sendTemplatedEmail, sendDonationReceipt } from '@/services/email/service'

vi.mock('@/integrations/brevo/sendEmail', () => {
  return {
    sendEmail: vi.fn(async () => ({ ok: true, messageId: 'msg1' })),
  }
})

const buildPayload = () => ({
  find: vi.fn(async () => ({
    docs: [
      {
        id: 'template1',
        subject: { en: 'Hi {{name}}' },
        body: { en: 'Body' },
        placeholders: [{ key: 'name' }],
      },
    ],
  })),
  findByID: vi.fn(async () => ({ id: 'contact1', email: 'donor@example.com', displayName: 'Friend' })),
  create: vi.fn(async (args: any) => ({ id: 'send1', ...args.data })),
  update: vi.fn(async (args: any) => ({ id: args.id, ...args.data })),
})

describe('email service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('[core] sendTemplatedEmail creates send and marks sent', async () => {
    const payload = buildPayload()

    const result = await sendTemplatedEmail(
      { payload },
      {
        templateSlug: 'receipt-donation',
        toEmail: 'donor@example.com',
        params: { name: 'Friend' },
        locale: 'en',
      },
    )

    expect(result.ok).toBe(true)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'emailSends',
        data: expect.objectContaining({ status: 'queued', toEmail: 'donor@example.com' }),
        overrideAccess: true,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'emailSends',
        id: 'send1',
        data: expect.objectContaining({ status: 'sent', providerMessageId: 'msg1' }),
        overrideAccess: true,
      }),
    )
  })

  it('[core] sendTemplatedEmail fails when placeholders missing', async () => {
    const payload = buildPayload()
    payload.find = vi.fn(async () => ({
      docs: [{ id: 'template1', subject: { en: 'Hi {{name}}' }, body: { en: 'Body' }, placeholders: [{ key: 'name' }, { key: 'amount' }] }],
    }))

    const result = await sendTemplatedEmail(
      { payload },
      {
        templateSlug: 'receipt-donation',
        toEmail: 'donor@example.com',
        params: { name: 'Friend' },
        locale: 'en',
      },
    )

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('missing_placeholders')
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'emailSends',
        data: expect.objectContaining({ status: 'failed', errorCode: 'missing_placeholders' }),
        overrideAccess: true,
      }),
    )
  })

  it('[core] sendDonationReceipt falls back when template missing', async () => {
    const payload = buildPayload()
    payload.find = vi.fn(async (args: any) => {
      if (args.collection === 'emailTemplates') return { docs: [] }
      return { docs: [] }
    })

    const result = await sendDonationReceipt(
      { payload },
      {
        order: { id: 'order1', totalUSD: 10, publicId: 'pub1', lang: 'en', contact: 'contact1' },
        toEmail: 'donor@example.com',
      },
    )

    expect(result.ok).toBe(true)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'emailSends',
        data: expect.objectContaining({
          source: 'inline',
          errorCode: 'template_not_found',
          toEmail: 'donor@example.com',
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 'order1',
        data: { receiptEmailSendId: 'send1' },
        overrideAccess: true,
      }),
    )
  })
})
