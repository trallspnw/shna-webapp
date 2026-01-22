import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTestEnv } from '../_support/testEnv'
import { resetMembershipsTestState } from '../_support/seed'
import { createCampaign, createMembershipPlan, resetFactoryState } from '../_support/factories'
import { postMemberships } from '../_support/http'

vi.mock('@/integrations/stripe/checkout', () => {
  return {
    createCheckoutSession: vi.fn(async () => ({ id: 'cs_test', url: 'https://stripe.test/checkout' })),
  }
})

const email = 'membership-test@example.com'
const CAMPAIGN_REFTAG = 'membership-campaign-2026'
const PLAN_SLUG = 'individual'

describe('memberships submit integration', () => {
  const envRef: { current: Awaited<ReturnType<typeof getTestEnv>> | null } = { current: null }

  beforeAll(async () => {
    envRef.current = await getTestEnv()
  })

  beforeEach(async () => {
    resetFactoryState()
    if (!envRef.current) return
    await resetMembershipsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      campaignReftags: [CAMPAIGN_REFTAG],
      planSlugs: [PLAN_SLUG],
    })
  })

  it('[core] submit creates order + order item and returns redirect', async () => {
    const env = envRef.current!
    await createCampaign(
      { payload: env.payload, req: env.req },
      { reftag: CAMPAIGN_REFTAG, name: 'Membership Campaign' },
    )

    const plan = await createMembershipPlan(
      { payload: env.payload, req: env.req },
      { slug: PLAN_SLUG, name: 'Individual', price: 10, renewalWindowDays: 30 },
    )

    const res = await postMemberships(env.payload, {
      email,
      name: 'Member Name',
      planSlug: PLAN_SLUG,
      language: 'en',
      ref: CAMPAIGN_REFTAG,
      entryUrl: 'https://example.com/memberships',
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.url).toContain('stripe')
    expect(body.data.publicOrderId).toBeTruthy()

    const orderLookup = await env.payload.find({
      collection: 'orders',
      where: { publicId: { equals: body.data.publicOrderId } },
      limit: 1,
      overrideAccess: true,
    })

    const order = orderLookup.docs[0] as any
    expect(order).toBeTruthy()
    expect(order.status).toBe('created')
    expect(order.totalUSD).toBe(10)
    const campaignId = (order.campaign && typeof order.campaign === 'object' && 'id' in order.campaign)
      ? (order.campaign as { id: string | number }).id
      : order.campaign
    expect(campaignId).toBeTruthy()

    const items = await env.payload.find({
      collection: 'orderItems',
      where: { order: { equals: order.id } },
      limit: 5,
      overrideAccess: true,
    })
    expect(items.docs.length).toBe(1)
    expect(items.docs[0]?.itemType).toBe('membership')

    const planLookup = await env.payload.findByID({
      collection: 'membershipPlans',
      id: plan.id,
      overrideAccess: true,
    })
    expect(planLookup).toBeTruthy()
  })

  it('[core] submit rejects bad request', async () => {
    const env = envRef.current!
    const res = await postMemberships(env.payload, { email })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] submit ignores unknown campaign ref', async () => {
    const env = envRef.current!
    await createMembershipPlan(
      { payload: env.payload, req: env.req },
      { slug: PLAN_SLUG, name: 'Individual', price: 10, renewalWindowDays: 30 },
    )

    const res = await postMemberships(env.payload, {
      email,
      planSlug: PLAN_SLUG,
      language: 'en',
      ref: 'unknown-ref',
      entryUrl: 'https://example.com/memberships',
    })

    expect(res.status).toBe(200)
    const body = await res.json()

    const orderLookup = await env.payload.find({
      collection: 'orders',
      where: { publicId: { equals: body.data.publicOrderId } },
      limit: 1,
      overrideAccess: true,
    })

    const order = orderLookup.docs[0] as any
    expect(order).toBeTruthy()
    expect(order.campaign ?? null).toBeNull()
  })
})
