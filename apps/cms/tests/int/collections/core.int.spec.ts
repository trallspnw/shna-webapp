import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Core Data Model', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('Contacts: normalizes email to lowercase', async () => {
    const unique = Date.now()
    const contact = await payload.create({
      collection: 'contacts',
      data: {
        email: `Test_${unique}@CASE.com`,
        displayName: 'Test User',
      },
    })
    expect(contact.email).toBe(`test_${unique}@case.com`)
  })

  it('Campaigns: creates a campaign', async () => {
    const unique = Date.now()
    const campaign = await payload.create({
      collection: 'campaigns',
      data: {
        key: `test-campaign-${unique}`,
        slug: `test-campaign-${unique}`,
        name: 'Test Campaign',
        isTest: true,
      },
    })
    expect(campaign.id).toBeDefined()
    expect(campaign.key).toBe(`test-campaign-${unique}`)
  })

  it('MembershipPlans: creates a plan', async () => {
    const unique = Date.now()
    const plan = await payload.create({
      collection: 'membershipPlans',
      data: {
        key: `standard-monthly-${unique}`,
        name: 'Standard Monthly',
        priceUSD: 10,
        durationMonths: 1,
        isTest: true,
      },
    })
    expect(plan.id).toBeDefined()
    expect(plan.priceUSD).toBe(10)
  })

  it('Subscriptions: enforces uniqueness for contact + topic', async () => {
    const unique = Date.now()
    // 1. Create Topic
    const topic = await payload.create({
      collection: 'subscriptionTopics',
      data: {
        key: `newsletter-${unique}`,
        name: 'Newsletter',
        isTest: true,
      },
    })

    // 2. Create Contact
    const contact = await payload.create({
      collection: 'contacts',
      data: {
        email: `subscriber_${unique}@example.com`,
        isTest: true,
      },
    })

    // 3. Create Subscription
    const sub1 = await payload.create({
      collection: 'subscriptions',
      data: {
        contact: contact.id,
        topic: topic.id,
        status: 'subscribed',
        isTest: true,
      },
    })
    expect(sub1.id).toBeDefined()

    // 4. Try to create duplicate Subscription -> Expect Error
    await expect(async () => {
      await payload.create({
        collection: 'subscriptions',
        data: {
          contact: contact.id,
          topic: topic.id,
          status: 'unsubscribed',
          isTest: true,
        },
      })
    }).rejects.toThrow() // Expect error from hook
  })
})
