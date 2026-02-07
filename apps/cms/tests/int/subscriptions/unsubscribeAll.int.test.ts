import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getTestEnv } from '../_support/testEnv'
import { resetSubscriptionsTestState } from '../_support/seed'
import {
  createContact,
  createSubscription,
  createTopic,
  resetFactoryState,
} from '../_support/factories'
import { postSubscriptions } from '../_support/http'
import { findContactByEmail, findSubscriptionsByContact } from '../_support/assertions'

const email = 'unsubscribe-test@example.com'
const TOPIC_SLUG = 'test-general-unsub'

describe('subscriptions unsubscribeAll integration', () => {
  const envRef: { current: Awaited<ReturnType<typeof getTestEnv>> | null } = { current: null }

  beforeAll(async () => {
    envRef.current = await getTestEnv()
  })

  beforeEach(async () => {
    resetFactoryState()
    if (!envRef.current) return
    await resetSubscriptionsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      topicSlugs: [TOPIC_SLUG],
    })
  })
  afterAll(async () => {
    if (!envRef.current) return
    await resetSubscriptionsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      topicSlugs: [TOPIC_SLUG],
    })
  })

  it('[core] unsubscribeAll deletes subscriptions and updates lastEngagedAt', async () => {
    const env = envRef.current!
    const topic = await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General Unsub' },
    )
    const contact = await createContact(
      { payload: env.payload, req: env.req },
      { email, lastEngagedAt: '2020-01-01T00:00:00.000Z' },
    )

    await createSubscription({ payload: env.payload, req: env.req }, { contact: contact.id, topic: topic.id })

    const res = await postSubscriptions(env.payload, {
      action: 'unsubscribeAll',
      email,
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    const updated = await findContactByEmail(env.payload, email)
    expect(updated?.lastEngagedAt).toBeTruthy()
    expect(updated?.lastEngagedAt).not.toBe('2020-01-01T00:00:00.000Z')

    const subs = await findSubscriptionsByContact(env.payload, contact.id)
    expect(subs).toHaveLength(0)
  })

  it('[core] unsubscribeAll is a no-op for missing contacts (privacy safe)', async () => {
    const env = envRef.current!

    const res = await postSubscriptions(env.payload, {
      action: 'unsubscribeAll',
      email,
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    const contact = await findContactByEmail(env.payload, email)
    expect(contact).toBeNull()
  })

  it('[core] unsubscribeAll is idempotent', async () => {
    const env = envRef.current!
    const topic = await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General Unsub' },
    )
    const contact = await createContact({ payload: env.payload, req: env.req }, { email })

    await createSubscription({ payload: env.payload, req: env.req }, { contact: contact.id, topic: topic.id })

    const first = await postSubscriptions(env.payload, {
      action: 'unsubscribeAll',
      email,
    })
    const second = await postSubscriptions(env.payload, {
      action: 'unsubscribeAll',
      email,
    })

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)

    const subs = await findSubscriptionsByContact(env.payload, contact.id)
    expect(subs).toHaveLength(0)
  })
})
