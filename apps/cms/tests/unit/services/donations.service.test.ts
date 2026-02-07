import { describe, it, expect, vi, beforeEach } from 'vitest'

import { submitDonation, submitDonationManual, getOrderStatus } from '@/services/donations/service'
import { ValidationError } from '@/services/donations/types'
import { createCheckoutSession } from '@/integrations/stripe/checkout'
import { sendDonationReceipt } from '@/services/email/service'

vi.mock('@/integrations/stripe/checkout', () => {
  return {
    createCheckoutSession: vi.fn(async () => ({ id: 'cs_test', url: 'https://stripe.test/checkout' })),
  }
})

vi.mock('@/services/email/service', () => {
  return {
    sendDonationReceipt: vi.fn(async () => ({ ok: true, emailSendId: 'email1' })),
  }
})

const mockPayload = () => ({
  findGlobal: vi.fn(async () => ({ maxDonationUSD: 10000 })),
  find: vi.fn(async (args: any) => {
    if (args.collection === 'campaigns') return { docs: [] }
    if (args.collection === 'contacts') return { docs: [] }
    if (args.collection === 'orders') return { docs: [] }
    return { docs: [] }
  }),
  create: vi.fn(async (args: any) => {
    if (args.collection === 'contacts') return { id: 'contact1' }
    if (args.collection === 'orders') return { id: 'order1', ...args.data }
    if (args.collection === 'orderItems') return { id: 'item1' }
    return { id: 'x' }
  }),
  update: vi.fn(async (args: any) => ({ id: args.id, ...args.data })),
})

describe('donations service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('[core] submitDonation creates order and order item', async () => {
    const payload = mockPayload()

    const result = await submitDonation(
      { payload },
      {
        email: 'donor@example.com',
        name: 'Donor Name',
        phone: '555-1234',
        addressText: '123 Main St',
        amountUSD: '25.00',
        lang: 'en',
        ref: null,
        checkoutName: 'Support SHNA',
        entryUrl: 'https://example.com/donate',
      },
    )

    expect(result.ok).toBe(true)
    expect(result.url).toContain('stripe')
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          status: 'created',
          totalUSD: 25,
          lang: 'en',
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orderItems',
        data: expect.objectContaining({
          itemType: 'donation',
          qty: 1,
          unitAmountUSD: 25,
          totalUSD: 25,
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 'order1',
        data: { stripeCheckoutSessionId: 'cs_test' },
        overrideAccess: true,
      }),
    )
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Support SHNA',
      }),
    )
  })

  it('[core] submitDonationManual creates paid order, item, and transaction', async () => {
    const payload = mockPayload()

    const result = await submitDonationManual(
      { payload },
      {
        email: 'donor@example.com',
        name: 'Donor Name',
        amountUSD: '25.00',
        paymentMethod: 'cash',
        locale: 'en',
      },
    )

    expect(result.ok).toBe(true)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          status: 'paid',
          totalUSD: 25,
          lang: 'en',
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orderItems',
        data: expect.objectContaining({
          itemType: 'donation',
          qty: 1,
          unitAmountUSD: 25,
          totalUSD: 25,
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'transactions',
        data: expect.objectContaining({
          paymentType: 'cash',
          amountUSD: 25,
        }),
        overrideAccess: true,
      }),
    )
    expect(sendDonationReceipt).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toEmail: 'donor@example.com',
      }),
    )
    expect(createCheckoutSession).not.toHaveBeenCalled()
  })

  it('[core] submitDonation rejects invalid amount', async () => {
    const payload = mockPayload()

    await expect(
      submitDonation(
        { payload },
        {
          email: 'donor@example.com',
          amountUSD: '10.999',
          lang: 'en',
          entryUrl: 'https://example.com/donate',
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('[core] submitDonation enforces max donation', async () => {
    const payload = mockPayload()
    payload.findGlobal = vi.fn(async () => ({ maxDonationUSD: 5 }))

    await expect(
      submitDonation(
        { payload },
        {
          email: 'donor@example.com',
          amountUSD: '10.00',
          lang: 'en',
          entryUrl: 'https://example.com/donate',
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('[core] submitDonation updates existing contact without clearing fields', async () => {
    const payload = mockPayload()
    payload.find = vi.fn(async (args: any) => {
      if (args.collection === 'contacts') {
        return { docs: [{ id: 'contact1', campaign: 'campaign1' }] }
      }
      if (args.collection === 'campaigns') {
        return { docs: [{ id: 'campaign2', reftag: 'spring' }] }
      }
      return { docs: [] }
    })

    await submitDonation(
      { payload },
      {
        email: 'donor@example.com',
        amountUSD: '10.00',
        lang: 'en',
        ref: 'spring',
        entryUrl: 'https://example.com/donate',
      },
    )

    const updateArgs = (payload.update as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(updateArgs?.collection).toBe('contacts')
    expect(updateArgs?.data).toBeDefined()
    expect(updateArgs.data).not.toHaveProperty('campaign')
  })

  it('[core] getOrderStatus returns terminal flag', async () => {
    const payload = mockPayload()
    payload.find = vi.fn(async () => ({ docs: [{ id: 'order1', status: 'paid', totalUSD: 12 }] }))

    const result = await getOrderStatus({ payload }, { publicOrderId: '11111111-1111-4111-8111-111111111111' })

    expect(result.status).toBe('paid')
    expect(result.terminal).toBe(true)
    expect(result.totalUSD).toBe(12)
  })

  it('[core] getOrderStatus rejects invalid publicOrderId', async () => {
    const payload = mockPayload()
    await expect(getOrderStatus({ payload }, { publicOrderId: 'not-a-uuid' })).rejects.toBeInstanceOf(
      ValidationError,
    )
  })
})
