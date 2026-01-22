import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Full Core Data Model', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('Membership: primary contact + terms validation', async () => {
    // 1. Create Contact
    const contact = await payload.create({
      collection: 'contacts',
      data: { email: 'member@test.com', displayName: 'Member' },
    })

    // 2. Create Plan
    const plan = await payload.create({
      collection: 'membershipPlans',
      data: { key: 'annual', name: 'Annual', durationMonths: 12, priceUSD: 100, isTest: true },
    })

    // 3. Create MembershipAccount
    const account = await payload.create({
      collection: 'membershipAccounts',
      data: {
        type: 'individual',
        primaryContact: contact.id,
        isTest: true,
      },
    })
    expect(account.id).toBeDefined()

    // 4. Create MembershipTerm (Success)
    const term = await payload.create({
      collection: 'membershipTerms',
      data: {
        membershipAccount: account.id,
        plan: plan.id,
        status: 'active',
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        isTest: true,
      },
    })
    expect(term.planKeySnapshot).toBe('annual')

    // 5. MembershipTerm (Fail: ends before starts)
    await expect(async () => {
      await payload.create({
        collection: 'membershipTerms',
        data: {
          membershipAccount: account.id,
          plan: plan.id,
          status: 'active',
          startsAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() - 10000).toISOString(),
          isTest: true,
        },
      })
    }).rejects.toThrow('Expiration date must be after start date')
  })

  it('Retail: Order + Items + total calculation', async () => {
    // 1. Create Product
    const product = await payload.create({
      collection: 'products',
      data: {
        key: 'shirt',
        slug: 't-shirt',
        name: 'T-Shirt',
        nonMemberPriceUSD: 20,
        isTest: true,
      },
    })

    // 2. Create Order
    const order = await payload.create({
      collection: 'orders',
      data: {
        status: 'pending',
        pricingBasis: 'non_member',
        isTest: true,
      },
    })
    expect(order.orderNumber).toMatch(/^ORD-/)

    // 3. Create OrderItem
    const item = await payload.create({
      collection: 'orderItems',
      data: {
        order: order.id,
        product: product.id,
        quantity: 2,
        unitPriceUSD: 20,
        isTest: true,
      },
    })
    expect(item.totalUSD).toBe(40)
  })

  it('Events: Attendance identity mode constraint', async () => {
    // 1. Create Event
    const event = await payload.create({
      collection: 'events',
      data: {
        slug: 'picnic-2024',
        title: 'Picnic',
        startsAt: new Date().toISOString(),
        isTest: true,
      },
    })

    // 2. Create Contact
    const contact = await payload.create({
      collection: 'contacts',
      data: { email: 'picnic@test.com' },
    })

    // 3. Success: Contact only
    const att1 = await payload.create({
      collection: 'eventAttendances',
      data: {
        event: event.id,
        contact: contact.id,
        isTest: true,
      },
    })
    expect(att1.id).toBeDefined()

    // 4. Success: Anon only
    const att2 = await payload.create({
      collection: 'eventAttendances',
      data: {
        event: event.id,
        anonymousCount: 5,
        isTest: true,
      },
    })
    expect(att2.id).toBeDefined()

    // 5. Fail: Contact AND Anon
    await expect(async () => {
      await payload.create({
        collection: 'eventAttendances',
        data: {
          event: event.id,
          contact: contact.id,
          anonymousCount: 1,
          isTest: true,
        },
      })
    }).rejects.toThrow('Attendance record must specify exactly one of')
  })

  it('Transactions: basic creation + anon protection', async () => {
    // 1. Create Transaction (Donation)
    const txn = await payload.create({
      collection: 'transactions',
      data: {
        kind: 'donation',
        amountUSD: 50,
        status: 'succeeded',
        isTest: true,
      },
    })
    expect(txn.occurredAt).toBeDefined() // Hook set default

    // 2. Fail: StayAnon + Contact
    const contact = await payload.create({
      collection: 'contacts',
      data: { email: 'donor@test.com' },
    })

    await expect(async () => {
      await payload.create({
        collection: 'transactions',
        data: {
          kind: 'donation',
          amountUSD: 50,
          stayAnon: true,
          contact: contact.id,
          isTest: true,
        },
      })
    }).rejects.toThrow('Cannot link Contact to a Transaction marked "Stay Anonymous"')
  })
})
