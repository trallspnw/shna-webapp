import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { getTestEnv } from '../_support/testEnv'
import { resetSubscriptionsTestState } from '../_support/seed'
import {
  createCampaign,
  createContact,
  createTopic,
  resetFactoryState,
} from '../_support/factories'
import { postSubscriptions } from '../_support/http'
import { findContactByEmail, findSubscriptionsByContact } from '../_support/assertions'

const email = 'subscribe-test@example.com'
const TOPIC_SLUG = 'test-general'
const CAMPAIGN_REFTAG = 'test-spring-2026'
const CAMPAIGN_REFTAG_FIRST = 'test-first-touch'
const CAMPAIGN_REFTAG_SECOND = 'test-second-touch'

describe('subscriptions subscribe integration', () => {
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
      campaignReftags: [CAMPAIGN_REFTAG, CAMPAIGN_REFTAG_FIRST, CAMPAIGN_REFTAG_SECOND],
    })
  })
  afterAll(async () => {
    if (!envRef.current) return
    await resetSubscriptionsTestState(envRef.current.payload, envRef.current.req, {
      emails: [email],
      topicSlugs: [TOPIC_SLUG],
      campaignReftags: [CAMPAIGN_REFTAG, CAMPAIGN_REFTAG_FIRST, CAMPAIGN_REFTAG_SECOND],
    })
  })

  it('[core] subscribe creates contact, normalizes email, and creates subscriptions', async () => {
    const env = envRef.current!
    const topic = await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )

    const res = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email: 'Subscribe-Test@Example.com',
      topics: ['Test-General'],
      ref: null,
      lang: 'es',
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    const contact = await findContactByEmail(env.payload, email)
    expect(contact).not.toBeNull()
    expect(contact?.email).toBe(email)
    expect(contact?.language).toBe('es')
    expect(contact?.lastEngagedAt).toBeTruthy()

    const subs = await findSubscriptionsByContact(env.payload, contact!.id)
    expect(subs).toHaveLength(1)
    expect(String(subs[0]?.topic)).toBe(String(topic.id))
  })

  it('[core] subscribe is idempotent for existing subscriptions', async () => {
    const env = envRef.current!
    await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )

    const first = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
    })
    const second = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
    })

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)

    const contact = await findContactByEmail(env.payload, email)
    const subs = await findSubscriptionsByContact(env.payload, contact!.id)
    expect(subs).toHaveLength(1)
  })

  it('[core] subscribe resolves campaign ref for new contact + subscriptions', async () => {
    const env = envRef.current!
    const topic = await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )
    const campaign = await createCampaign(
      { payload: env.payload, req: env.req },
      { reftag: CAMPAIGN_REFTAG, name: 'Spring 2026' },
    )

    const res = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
      ref: 'Test-Spring-2026',
    })

    expect(res.status).toBe(200)

    const contact = await findContactByEmail(env.payload, email)
    expect(String(contact?.campaign)).toBe(String(campaign.id))

    const subs = await findSubscriptionsByContact(env.payload, contact!.id)
    expect(subs).toHaveLength(1)
    expect(String(subs[0]?.topic)).toBe(String(topic.id))
    expect(String(subs[0]?.campaign)).toBe(String(campaign.id))
  })

  it('[core] subscribe ignores unknown campaign ref', async () => {
    const env = envRef.current!
    await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )

    const res = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
      ref: 'unknown-ref',
    })

    expect(res.status).toBe(200)

    const contact = await findContactByEmail(env.payload, email)
    expect(contact?.campaign ?? null).toBeNull()
  })

  it('[core] subscribe does not overwrite existing contact campaign', async () => {
    const env = envRef.current!
    const topic = await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )
    const existingCampaign = await createCampaign(
      { payload: env.payload, req: env.req },
      { reftag: CAMPAIGN_REFTAG_FIRST, name: 'First Touch' },
    )
    const newCampaign = await createCampaign(
      { payload: env.payload, req: env.req },
      { reftag: CAMPAIGN_REFTAG_SECOND, name: 'Second Touch' },
    )

    const contact = await createContact(
      { payload: env.payload, req: env.req },
      { email, campaign: existingCampaign.id },
    )

    const res = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
      ref: CAMPAIGN_REFTAG_SECOND,
    })

    expect(res.status).toBe(200)

    const updated = await findContactByEmail(env.payload, email)
    expect(String(updated?.campaign)).toBe(String(existingCampaign.id))

    const subs = await findSubscriptionsByContact(env.payload, contact.id)
    expect(subs).toHaveLength(1)
    expect(String(subs[0]?.campaign)).toBe(String(newCampaign.id))
  })

  it('[core] subscribe rejects missing fields and unknown topics', async () => {
    const env = envRef.current!
    await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )

    const missingTopics = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
    })

    expect(missingTopics.status).toBe(400)
    expect(await missingTopics.json()).toEqual({ ok: false, error: 'bad_request' })

    const missingAction = await postSubscriptions(env.payload, {
      email,
      topics: [TOPIC_SLUG],
    })

    expect(missingAction.status).toBe(400)
    expect(await missingAction.json()).toEqual({ ok: false, error: 'bad_request' })

    const missingEmail = await postSubscriptions(env.payload, {
      action: 'subscribe',
      topics: [TOPIC_SLUG],
    })

    expect(missingEmail.status).toBe(400)
    expect(await missingEmail.json()).toEqual({ ok: false, error: 'bad_request' })

    const unknownTopic = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: ['missing-topic'],
    })

    expect(unknownTopic.status).toBe(400)
    const unknownBody = await unknownTopic.json()
    expect(unknownBody).toEqual({ ok: false, error: 'bad_request' })
    expect(Object.keys(unknownBody).sort()).toEqual(['error', 'ok'])
  })

  it('[core] subscribe response does not reveal contact existence', async () => {
    const env = envRef.current!
    await createTopic(
      { payload: env.payload, req: env.req },
      { slug: TOPIC_SLUG, name: 'Test General' },
    )

    const first = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
    })
    const firstBody = await first.json()

    const second = await postSubscriptions(env.payload, {
      action: 'subscribe',
      email,
      topics: [TOPIC_SLUG],
    })
    const secondBody = await second.json()

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(firstBody).toEqual({ ok: true })
    expect(secondBody).toEqual({ ok: true })
  })
})
