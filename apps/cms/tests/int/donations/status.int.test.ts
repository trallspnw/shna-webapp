import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getTestEnv } from '../_support/testEnv'
import { resetDonationsTestState } from '../_support/seed'
import { createContact, resetFactoryState } from '../_support/factories'
import { getOrderStatus } from '../_support/http'

const email = 'status-test@example.com'
const PUBLIC_ID = '11111111-1111-4111-8111-111111111111'

describe('orders status integration', () => {
  const envRef: { current: Awaited<ReturnType<typeof getTestEnv>> | null } = { current: null }

  beforeAll(async () => {
    envRef.current = await getTestEnv()
  })

  beforeEach(async () => {
    resetFactoryState()
    if (!envRef.current) return
    await resetDonationsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      orderPublicIds: [PUBLIC_ID],
    })
  })

  it('[core] status returns terminal flag', async () => {
    const env = envRef.current!
    const contact = await createContact({ payload: env.payload, req: env.req }, { email })

    await env.payload.create({
      collection: 'orders',
      data: {
        publicId: PUBLIC_ID,
        status: 'paid',
        contact: contact.id,
        totalUSD: 10,
        lang: 'en',
      },
      overrideAccess: true,
    })

    const res = await getOrderStatus(env.payload, PUBLIC_ID)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      ok: true,
      data: { status: 'paid', terminal: true, totalUSD: 10 },
    })
  })

  it('[core] status returns non-terminal for created', async () => {
    const env = envRef.current!
    const contact = await createContact({ payload: env.payload, req: env.req }, { email })

    await env.payload.create({
      collection: 'orders',
      data: {
        publicId: PUBLIC_ID,
        status: 'created',
        contact: contact.id,
        totalUSD: 20,
        lang: 'en',
      },
      overrideAccess: true,
    })

    const res = await getOrderStatus(env.payload, PUBLIC_ID)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      ok: true,
      data: { status: 'created', terminal: false, totalUSD: 20 },
    })
  })

  it('[core] status rejects invalid id', async () => {
    const env = envRef.current!
    const res = await getOrderStatus(env.payload, 'not-a-uuid')
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] status rejects missing order', async () => {
    const env = envRef.current!
    const res = await getOrderStatus(env.payload, PUBLIC_ID)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })
})
