import { describe, it, expect, vi, beforeEach } from 'vitest'

import { applyPaymentEvent } from '@/services/orders/service'

vi.mock('@/services/email/service', () => {
  return {
    sendDonationReceipt: vi.fn(async () => ({ ok: true, emailSendId: 'email1' })),
  }
})

vi.mock('@/services/memberships/webhook', () => {
  return {
    handleMembershipCheckoutCompleted: vi.fn(async () => true),
  }
})

const buildPayload = () => {
  return {
    find: vi.fn(async (args: any) => {
      if (args.collection === 'orders') {
        return { docs: [{ id: 'order1', status: 'created', totalUSD: 25, contact: 'contact1' }] }
      }
      if (args.collection === 'orderItems') {
        return { docs: [{ id: 'item1', itemType: 'donation' }] }
      }
      if (args.collection === 'transactions') {
        return { docs: [] }
      }
      return { docs: [] }
    }),
    update: vi.fn(async (args: any) => ({ id: args.id, ...args.data })),
    create: vi.fn(async (args: any) => ({ id: 'tx1', ...args.data })),
  }
}

describe('orders service applyPaymentEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('[core] completed marks order paid and creates transaction + receipt', async () => {
    const payload = buildPayload()

    await applyPaymentEvent(
      { payload },
      {
        type: 'checkout.session.completed',
        session: { sessionId: 'cs_test', paymentIntentId: 'pi_test' },
      },
    )

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 'order1',
        data: expect.objectContaining({ status: 'paid', stripePaymentIntentId: 'pi_test' }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'transactions',
        data: expect.objectContaining({ order: 'order1', paymentType: 'stripe' }),
        overrideAccess: true,
      }),
    )
  })

  it('[core] completed is idempotent when already paid', async () => {
    const payload = buildPayload()
    payload.find = vi.fn(async (args: any) => {
      if (args.collection === 'orders') {
        return { docs: [{ id: 'order1', status: 'paid', totalUSD: 25, contact: 'contact1' }] }
      }
      if (args.collection === 'transactions') {
        return { docs: [{ id: 'tx1' }] }
      }
      if (args.collection === 'orderItems') {
        return { docs: [{ id: 'item1', itemType: 'donation' }] }
      }
      return { docs: [] }
    })

    await applyPaymentEvent(
      { payload },
      {
        type: 'checkout.session.completed',
        session: { sessionId: 'cs_test', paymentIntentId: 'pi_test' },
      },
    )

    expect(payload.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'transactions' }),
    )
    expect(payload.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 'order1',
        data: expect.objectContaining({ status: 'paid' }),
      }),
    )

    const updateCalls = (payload.update as unknown as ReturnType<typeof vi.fn>).mock.calls
    const nonTransactionUpdates = updateCalls.filter(
      (call) => call[0]?.collection !== 'transactions',
    )
    expect(nonTransactionUpdates).toHaveLength(0)
  })

  it('[core] completed twice creates only one transaction', async () => {
    const payload = buildPayload()
    let txCount = 0

    payload.find = vi.fn(async (args: any) => {
      if (args.collection === 'orders') {
        return { docs: [{ id: 'order1', status: 'created', totalUSD: 25, contact: 'contact1' }] }
      }
      if (args.collection === 'transactions') {
        return { docs: txCount > 0 ? [{ id: 'tx1', stripeRefId: 'cs_test' }] : [] }
      }
      if (args.collection === 'orderItems') {
        return { docs: [{ id: 'item1', itemType: 'donation' }] }
      }
      return { docs: [] }
    })

    payload.create = vi.fn(async (args: any) => {
      if (args.collection === 'transactions') {
        txCount += 1
        return { id: 'tx1', ...args.data }
      }
      return { id: 'x' }
    })

    await applyPaymentEvent(
      { payload },
      { type: 'checkout.session.completed', session: { sessionId: 'cs_test' } },
    )
    await applyPaymentEvent(
      { payload },
      { type: 'checkout.session.completed', session: { sessionId: 'cs_test' } },
    )

    expect(txCount).toBe(1)
  })

  it('[core] expired marks order expired when not paid', async () => {
    const payload = buildPayload()

    await applyPaymentEvent(
      { payload },
      {
        type: 'checkout.session.expired',
        session: { sessionId: 'cs_test' },
      },
    )

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 'order1',
        data: { status: 'expired' },
        overrideAccess: true,
      }),
    )
  })

  it('[core] expired does not downgrade paid order', async () => {
    const payload = buildPayload()
    payload.find = vi.fn(async (args: any) => {
      if (args.collection === 'orders') {
        return { docs: [{ id: 'order1', status: 'paid', totalUSD: 25 }] }
      }
      return { docs: [] }
    })

    await applyPaymentEvent(
      { payload },
      {
        type: 'checkout.session.expired',
        session: { sessionId: 'cs_test' },
      },
    )

    expect(payload.update).not.toHaveBeenCalled()
  })
})
