import { describe, it, expect, vi } from 'vitest'

import { subscribe, unsubscribeAll } from '@/services/subscriptions/service'
import { ValidationError } from '@/services/subscriptions/types'

describe('subscriptions service', () => {
  it('[core] subscribe creates contact + subscription when none exist', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'subscriptionTopics') {
          return { docs: [{ id: 'topic1', slug: 'general' }] }
        }
        if (args.collection === 'contacts') {
          return { docs: [] }
        }
        if (args.collection === 'subscriptions') {
          return { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(async (args: any) => {
        if (args.collection === 'contacts') return { id: 'contact1' }
        if (args.collection === 'subscriptions') return { id: 'sub1' }
        return { id: 'x' }
      }),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    const result = await subscribe(
      { payload },
      {
        action: 'subscribe',
        email: 'Test@Example.com',
        // covers slug normalization (service should lower-case)
        topics: ['General'],
        ref: null,
        lang: 'en',
      },
    )

    expect(result.ok).toBe(true)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'contacts',
        data: expect.objectContaining({
          email: 'test@example.com',
          language: 'en',
          lastEngagedAt: expect.any(String),
        }),
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'subscriptions',
        data: expect.objectContaining({
          contact: 'contact1',
          topic: 'topic1',
        }),
      }),
    )
  })

  it('[core] subscribe updates existing contact language + lastEngagedAt', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'campaigns') {
          return { docs: [] }
        }
        if (args.collection === 'subscriptionTopics') {
          return { docs: [{ id: 'topic1', slug: 'general' }] }
        }
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1' }] }
        }
        if (args.collection === 'subscriptions') {
          return { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(async () => ({ id: 'sub1' })),
      update: vi.fn(async () => ({ id: 'contact1' })),
      delete: vi.fn(),
    } as any

    await subscribe(
      { payload },
      {
        action: 'subscribe',
        email: 'test@example.com',
        topics: ['general'],
        ref: null,
        lang: 'es',
      },
    )

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'contacts',
        id: 'contact1',
        data: expect.objectContaining({
          language: 'es',
          lastEngagedAt: expect.any(String),
        }),
      }),
    )
  })

  it('[core] subscribe does not overwrite existing contact campaign', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'campaigns') {
          return { docs: [{ id: 'campaign2', reftag: 'spring' }] }
        }
        if (args.collection === 'subscriptionTopics') {
          return { docs: [{ id: 'topic1', slug: 'general' }] }
        }
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1', campaign: 'campaign1' }] }
        }
        if (args.collection === 'subscriptions') {
          return { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(async () => ({ id: 'sub1' })),
      update: vi.fn(async () => ({ id: 'contact1' })),
      delete: vi.fn(),
    } as any

    await subscribe(
      { payload },
      {
        action: 'subscribe',
        email: 'test@example.com',
        topics: ['general'],
        ref: 'spring',
        lang: null,
      },
    )

    const updateArgs = (payload.update as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    expect(updateArgs?.data).toBeDefined()
    expect(updateArgs.data).not.toHaveProperty('campaign')
  })

  it('[core] subscribe is idempotent when already subscribed', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'subscriptionTopics') {
          return { docs: [{ id: 'topic1', slug: 'general' }] }
        }
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1' }] }
        }
        if (args.collection === 'subscriptions') {
          return { docs: [{ id: 'sub1', topic: 'topic1' }] }
        }
        return { docs: [] }
      }),
      create: vi.fn(),
      update: vi.fn(async () => ({ id: 'contact1' })),
      delete: vi.fn(),
    } as any

    const result = await subscribe(
      { payload },
      {
        action: 'subscribe',
        email: 'test@example.com',
        topics: ['general'],
        ref: null,
        lang: null,
      },
    )

    expect(result.subscriptionIds).toEqual(['sub1'])
    expect(payload.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'subscriptions' }),
    )
  })

  it('[core] subscribe throws validation error when topic missing', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'subscriptionTopics') {
          return { docs: [{ id: 'topic1', slug: 'general' }] }
        }
        return { docs: [] }
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    await expect(
      subscribe(
        { payload },
        {
          action: 'subscribe',
          email: 'test@example.com',
          topics: ['general', 'missing'],
          ref: null,
          lang: null,
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('[core] subscribe warns on missing campaign and still succeeds', async () => {
    const logger = { warn: vi.fn() }
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'campaigns') {
          return { docs: [] }
        }
        if (args.collection === 'subscriptionTopics') {
          return { docs: [{ id: 'topic1', slug: 'general' }] }
        }
        if (args.collection === 'contacts') {
          return { docs: [] }
        }
        if (args.collection === 'subscriptions') {
          return { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(async (args: any) => {
        if (args.collection === 'contacts') return { id: 'contact1' }
        if (args.collection === 'subscriptions') return { id: 'sub1' }
        return { id: 'x' }
      }),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    const result = await subscribe(
      { payload, logger },
      {
        action: 'subscribe',
        email: 'test@example.com',
        topics: ['general'],
        ref: 'missing-campaign',
        lang: null,
      },
    )

    expect(result.ok).toBe(true)
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })

  it('[core] unsubscribeAll deletes subscriptions when present', async () => {
    let subsCalls = 0

    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1' }] }
        }
        if (args.collection === 'subscriptions') {
          subsCalls += 1
          // Return docs once, then empty (supports services that re-fetch page 1 while deleting)
          return subsCalls === 1 ? { docs: [{ id: 'sub1' }, { id: 'sub2' }] } : { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    const result = await unsubscribeAll(
      { payload },
      {
        action: 'unsubscribeAll',
        email: 'test@example.com',
      },
    )

    expect(result.deleted).toBe(2)

    expect(payload.delete).toHaveBeenCalledTimes(2)
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'subscriptions',
        id: 'sub1',
      }),
    )
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'subscriptions',
        id: 'sub2',
      }),
    )

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'contacts',
        id: 'contact1',
        data: { lastEngagedAt: expect.any(String) },
      }),
    )
  })

  it('[core] unsubscribeAll no-op when contact missing', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'contacts') {
          return { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    const result = await unsubscribeAll(
      { payload },
      {
        action: 'unsubscribeAll',
        email: 'test@example.com',
      },
    )

    expect(result.contactId).toBeNull()
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it('[core] unsubscribeAll no-op when no subscriptions exist', async () => {
    const payload = {
      find: vi.fn(async (args: any) => {
        if (args.collection === 'contacts') {
          return { docs: [{ id: 'contact1' }] }
        }
        if (args.collection === 'subscriptions') {
          return { docs: [] }
        }
        return { docs: [] }
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any

    const result = await unsubscribeAll(
      { payload },
      {
        action: 'unsubscribeAll',
        email: 'test@example.com',
      },
    )

    expect(result.deleted).toBe(0)
    expect(payload.delete).not.toHaveBeenCalled()
  })
})
