import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTestEnv } from '../_support/testEnv'
import { resetMembershipsTestState } from '../_support/seed'
import { createMembershipPlan, resetFactoryState } from '../_support/factories'
import { postMemberships } from '../_support/http'
import { handleCheckoutSessionCompleted } from '@/webhooks/stripe'
import { getDatePartsInPacific } from '@/services/memberships/dates'

vi.mock('@/integrations/stripe/checkout', () => {
  return {
    createCheckoutSession: vi.fn(async () => ({ id: 'cs_test', url: 'https://stripe.test/checkout' })),
  }
})

vi.mock('@/integrations/brevo/sendEmail', () => {
  return {
    sendEmail: vi.fn(async () => ({ ok: true, messageId: 'email_test' })),
  }
})

const email = 'membership-webhook@example.com'
const PLAN_SLUG = 'test-family'

describe('memberships webhook integration', () => {
  const envRef: { current: Awaited<ReturnType<typeof getTestEnv>> | null } = { current: null }

  beforeAll(async () => {
    envRef.current = await getTestEnv()
  })

  beforeEach(async () => {
    resetFactoryState()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
    if (!envRef.current) return
    await resetMembershipsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      planSlugs: [PLAN_SLUG],
    })
  })
  afterAll(async () => {
    if (!envRef.current) return
    await resetMembershipsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      planSlugs: [PLAN_SLUG],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('[core] webhook creates membership and marks order paid', async () => {
    const env = envRef.current!
    const plan = await createMembershipPlan(
      { payload: env.payload, req: env.req },
      { slug: PLAN_SLUG, name: 'Family', price: 20, renewalWindowDays: 30 },
    )

    const submitRes = await postMemberships(env.payload, {
      email,
      name: 'Member Name',
      planSlug: PLAN_SLUG,
      language: 'en',
      entryUrl: 'https://example.com/memberships',
    })

    const submitBody = await submitRes.json()
    const publicOrderId = submitBody.data.publicOrderId

    const orderLookup = await env.payload.find({
      collection: 'orders',
      where: { publicId: { equals: publicOrderId } },
      limit: 1,
      overrideAccess: true,
    })
    const order = orderLookup.docs[0] as any
    const contactId =
      order?.contact && typeof order.contact === 'object' && 'id' in order.contact
        ? (order.contact as { id: number | string }).id
        : order?.contact

    await handleCheckoutSessionCompleted({
      event: {
        data: {
          object: {
            id: 'cs_test',
            payment_intent: 'pi_test',
            customer_email: email,
            metadata: {
              planSlug: PLAN_SLUG,
              planId: String(plan.id),
            },
          },
        },
      },
      payload: env.payload,
      stripe: {},
    })

    const refreshedOrder = await env.payload.findByID({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
    })
    expect(refreshedOrder.status).toBe('paid')

    const memberships = await env.payload.find({
      collection: 'memberships',
      where: { contact: { equals: contactId } },
      limit: 5,
      overrideAccess: true,
    })

    expect(memberships.docs.length).toBe(1)
    const membership = memberships.docs[0] as any
    const membershipPlanId =
      membership.plan && typeof membership.plan === 'object' && 'id' in membership.plan
        ? (membership.plan as { id: number | string }).id
        : membership.plan
    expect(String(membershipPlanId)).toBe(String(plan.id))

    const startParts = getDatePartsInPacific(new Date(membership.startDay))
    const endParts = getDatePartsInPacific(new Date(membership.endDay))
    expect(startParts).toEqual({ year: 2026, month: 2, day: 7 })
    expect(endParts).toEqual({ year: 2027, month: 2, day: 6 })
  })
})
