import { getPayload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect, vi } from 'vitest'

// Mock Brevo lib
const { mockSync, mockSend } = vi.hoisted(() => {
  return {
    mockSync: vi.fn(),
    mockSend: vi.fn(),
  }
})

vi.mock('@/lib/brevo', () => {
  return {
    syncContactToList: mockSync,
    sendEmail: mockSend,
  }
})

describe('Brevo Sync Integration', () => {
  let payload: any

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('Syncs to list on new subscription', async () => {
    const unique = Date.now()

    // 1. Create Topic with list ID
    const topic = await payload.create({
      collection: 'subscriptionTopics',
      data: {
        name: 'Newsletter',
        key: `newsletter-sync-${unique}`,
        brevoListId: 123,
        isTest: true,
      },
    })

    // 2. Create Contact
    const contact = await payload.create({
      collection: 'contacts',
      data: { email: `sync_${unique}@test.com` },
    })

    // 3. Subscribe -> Should trigger mockSync
    await payload.create({
      collection: 'subscriptions',
      data: {
        contact: contact.id,
        topic: topic.id,
        status: 'subscribed',
        isTest: true,
      },
    })

    expect(mockSync).toHaveBeenCalledWith(`sync_${unique}@test.com`, 123)
  })
})
