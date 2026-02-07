import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { submitMembership, submitMembershipManual } from '@/services/memberships/service'
import { ValidationError } from '@/services/memberships/types'
import { calculateMembershipTermDates } from '@/services/memberships/terms'
import { sendMembershipReceipt } from '@/services/email/service'

vi.mock('@/integrations/stripe/checkout', () => {
  return {
    createCheckoutSession: vi.fn(async () => ({ id: 'cs_test', url: 'https://stripe.test/checkout' })),
  }
})

vi.mock('@/services/email/service', () => {
  return {
    sendMembershipReceipt: vi.fn(async () => ({ ok: true, emailSendId: 'email1' })),
  }
})

const buildPayload = (overrides: Partial<any> = {}) => {
  const plan = {
    id: 'plan1',
    slug: 'individual',
    name: 'Individual',
    price: 10,
    renewalWindowDays: 30,
  }

  return {
    find: vi.fn(async (args: any) => {
      if (args.collection === 'membershipPlans') return { docs: [plan] }
      if (args.collection === 'contacts') return { docs: [] }
      if (args.collection === 'memberships') return { docs: [] }
      if (args.collection === 'campaigns') return { docs: [] }
      if (args.collection === 'orders') return { docs: [] }
      return { docs: [] }
    }),
    create: vi.fn(async (args: any) => {
      if (args.collection === 'contacts') return { id: 'contact1', ...args.data }
      if (args.collection === 'orders') return { id: 'order1', ...args.data }
      if (args.collection === 'orderItems') return { id: 'item1', ...args.data }
      if (args.collection === 'memberships') return { id: 'membership1', ...args.data }
      if (args.collection === 'transactions') return { id: 'transaction1', ...args.data }
      return { id: 'x', ...args.data }
    }),
    update: vi.fn(async (args: any) => ({ id: args.id, ...args.data })),
    ...overrides,
  }
}

describe('memberships service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('[core] submitMembership creates order and order item', async () => {
    const payload = buildPayload()

    const result = await submitMembership(
      { payload },
      {
        email: 'member@example.com',
        name: 'Member Name',
        phone: '555-0000',
        address: '123 Main St',
        planSlug: 'individual',
        language: 'en',
        entryUrl: 'https://example.com/memberships',
      },
    )

    expect(result.ok).toBe(true)
    expect(result.url).toContain('stripe')
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          status: 'created',
          totalUSD: 10,
          lang: 'en',
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orderItems',
        data: expect.objectContaining({
          itemType: 'membership',
          qty: 1,
          unitAmountUSD: 10,
          totalUSD: 10,
        }),
        overrideAccess: true,
      }),
    )
  })

  it('[core] submitMembershipManual creates paid order, term, and receipt', async () => {
    const payload = buildPayload()

    const result = await submitMembershipManual(
      { payload },
      {
        email: 'member@example.com',
        name: 'Member Name',
        planSlug: 'individual',
        paymentMethod: 'check',
        locale: 'en',
      },
    )

    expect(result.ok).toBe(true)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          status: 'paid',
          totalUSD: 10,
          lang: 'en',
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'memberships',
        data: expect.objectContaining({
          plan: 'plan1',
        }),
        overrideAccess: true,
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'transactions',
        data: expect.objectContaining({
          paymentType: 'check',
          amountUSD: 10,
        }),
        overrideAccess: true,
      }),
    )
    expect(sendMembershipReceipt).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toEmail: 'member@example.com',
        membershipEndDay: expect.any(String),
      }),
    )
  })

  it('[core] submitMembership blocks early renewal for active membership', async () => {
    const payload = buildPayload({
      find: vi.fn(async (args: any) => {
        if (args.collection === 'membershipPlans') {
          return {
            docs: [
              { id: 'plan1', slug: 'individual', name: 'Individual', price: 10, renewalWindowDays: 30 },
            ],
          }
        }
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1' }] }
        }
        if (args.collection === 'memberships') {
          return {
            docs: [
              {
                id: 'm1',
                startDay: '2026-01-01T08:00:00.000Z',
                endDay: '2026-12-31T08:00:00.000Z',
              },
            ],
          }
        }
        return { docs: [] }
      }),
    })

    await expect(
      submitMembership(
        { payload },
        {
          email: 'member@example.com',
          planSlug: 'individual',
          language: 'en',
          entryUrl: 'https://example.com/memberships',
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('[core] submitMembership allows renewal within window', async () => {
    const payload = buildPayload({
      find: vi.fn(async (args: any) => {
        if (args.collection === 'membershipPlans') {
          return {
            docs: [
              { id: 'plan1', slug: 'individual', name: 'Individual', price: 10, renewalWindowDays: 30 },
            ],
          }
        }
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1' }] }
        }
        if (args.collection === 'memberships') {
          return {
            docs: [
              {
                id: 'm1',
                startDay: '2026-01-01T08:00:00.000Z',
                endDay: '2026-02-10T08:00:00.000Z',
              },
            ],
          }
        }
        return { docs: [] }
      }),
    })

    const result = await submitMembership(
      { payload },
      {
        email: 'member@example.com',
        planSlug: 'individual',
        language: 'en',
        entryUrl: 'https://example.com/memberships',
      },
    )

    expect(result.ok).toBe(true)
  })

  it('[core] submitMembership does not overwrite contact with empty values', async () => {
    const payload = buildPayload({
      find: vi.fn(async (args: any) => {
        if (args.collection === 'membershipPlans') {
          return {
            docs: [
              { id: 'plan1', slug: 'individual', name: 'Individual', price: 10, renewalWindowDays: 30 },
            ],
          }
        }
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1', campaign: 'campaign1' }] }
        }
        return { docs: [] }
      }),
    })

    await submitMembership(
      { payload },
      {
        email: 'member@example.com',
        name: '  ',
        phone: '',
        address: null,
        planSlug: 'individual',
        entryUrl: 'https://example.com/memberships',
      },
    )

    const updateArgs = (payload.update as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(updateArgs?.collection).toBe('contacts')
    expect(updateArgs?.data).not.toHaveProperty('campaign')
    expect(updateArgs?.data).not.toHaveProperty('name')
    expect(updateArgs?.data).not.toHaveProperty('phone')
    expect(updateArgs?.data).not.toHaveProperty('address')
  })

  it('[core] term calculation uses inclusive year minus one day', () => {
    const { startParts, endParts } = calculateMembershipTermDates(
      new Date('2026-02-07T12:00:00Z'),
      null,
      30,
    )

    expect(startParts).toEqual({ year: 2026, month: 2, day: 7 })
    expect(endParts).toEqual({ year: 2027, month: 2, day: 6 })
  })

  it('[core] expired membership starts today', () => {
    const { startParts } = calculateMembershipTermDates(
      new Date('2026-02-07T12:00:00Z'),
      { startDay: '2024-01-01T08:00:00.000Z', endDay: '2025-01-01T08:00:00.000Z' },
      30,
    )

    expect(startParts).toEqual({ year: 2026, month: 2, day: 7 })
  })
})
