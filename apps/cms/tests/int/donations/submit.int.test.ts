import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTestEnv } from '../_support/testEnv'
import { resetDonationsTestState } from '../_support/seed'
import { createCampaign, resetFactoryState } from '../_support/factories'
import { postDonations } from '../_support/http'

vi.mock('@/integrations/stripe/checkout', () => {
  return {
    createCheckoutSession: vi.fn(async () => ({ id: 'cs_test', url: 'https://stripe.test/checkout' })),
  }
})

const email = 'donation-test@example.com'
const CAMPAIGN_REFTAG = 'donation-campaign-2026'

describe('donations submit integration', () => {
  const envRef: { current: Awaited<ReturnType<typeof getTestEnv>> | null } = { current: null }

  beforeAll(async () => {
    envRef.current = await getTestEnv()
  })

  beforeEach(async () => {
    resetFactoryState()
    if (!envRef.current) return
    await resetDonationsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      campaignReftags: [CAMPAIGN_REFTAG],
    })
  })
  afterAll(async () => {
    if (!envRef.current) return
    await resetDonationsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      campaignReftags: [CAMPAIGN_REFTAG],
    })
  })

  it('[core] submit creates order + order item and returns redirect', async () => {
    const env = envRef.current!
    const campaign = await createCampaign(
      { payload: env.payload, req: env.req },
      { reftag: CAMPAIGN_REFTAG, name: 'Donation Campaign' },
    )

    const res = await postDonations(env.payload, {
      email,
      name: 'Donor Name',
      amountUSD: '25.00',
      lang: 'en',
      ref: CAMPAIGN_REFTAG,
      checkoutName: 'Support SHNA',
      entryUrl: 'https://example.com/donate',
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
    expect(order.totalUSD).toBe(25)
    const campaignId = (order.campaign && typeof order.campaign === 'object' && 'id' in order.campaign)
      ? (order.campaign as { id: string | number }).id
      : order.campaign
    expect(String(campaignId)).toBe(String(campaign.id))

    const items = await env.payload.find({
      collection: 'orderItems',
      where: { order: { equals: order.id } },
      limit: 5,
      overrideAccess: true,
    })
    expect(items.docs.length).toBe(1)
    expect(items.docs[0]?.itemType).toBe('donation')
  })

  it('[core] submit rejects bad request', async () => {
    const env = envRef.current!
    const res = await postDonations(env.payload, { email })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] submit ignores unknown campaign ref', async () => {
    const env = envRef.current!

    const res = await postDonations(env.payload, {
      email,
      amountUSD: '10.00',
      lang: 'en',
      ref: 'unknown-ref',
      entryUrl: 'https://example.com/donate',
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

  it('[core] submit rejects invalid amount', async () => {
    const env = envRef.current!
    const res = await postDonations(env.payload, {
      email,
      amountUSD: '10.999',
      lang: 'en',
      entryUrl: 'https://example.com/donate',
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] submit rejects missing entryUrl', async () => {
    const env = envRef.current!
    const res = await postDonations(env.payload, {
      email,
      amountUSD: '10.00',
      lang: 'en',
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })
})
