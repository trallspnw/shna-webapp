import { describe, it, expect, vi } from 'vitest'

import { resolveCampaignIdFromRef } from '@/services/campaigns/resolveCampaign'

describe('resolveCampaignIdFromRef', () => {
  it('[core] returns null for null or undefined', async () => {
    const payload = { find: vi.fn() } as any

    expect(await resolveCampaignIdFromRef(payload, null)).toBeNull()
    expect(await resolveCampaignIdFromRef(payload, undefined)).toBeNull()
    expect(payload.find).not.toHaveBeenCalled()
  })

  it('[core] returns null for empty or whitespace', async () => {
    const payload = { find: vi.fn() } as any
    const logger = { warn: vi.fn() }

    expect(await resolveCampaignIdFromRef(payload, '   ', logger)).toBeNull()
    expect(payload.find).not.toHaveBeenCalled()
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('[core] returns null for invalid format', async () => {
    const payload = { find: vi.fn() } as any
    const logger = { warn: vi.fn() }

    expect(await resolveCampaignIdFromRef(payload, 'Bad Ref!', logger)).toBeNull()
    expect(payload.find).not.toHaveBeenCalled()
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('[core] resolves valid ref', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [{ id: 123 }] }),
    } as any

    const result = await resolveCampaignIdFromRef(payload, '  FB-Event2  ')

    expect(result).toBe(123)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'campaigns',
        where: {
          reftag: { equals: 'fb-event2' },
        },
      }),
    )
  })

  it('[core] allows string ids', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [{ id: 'camp-123' }] }),
    } as any

    const result = await resolveCampaignIdFromRef(payload, 'fb-event2')

    expect(result).toBe('camp-123')
  })

  it('[core] warns when no campaign found', async () => {
    const payload = { find: vi.fn().mockResolvedValue({ docs: [] }) } as any
    const logger = { warn: vi.fn() }

    const result = await resolveCampaignIdFromRef(payload, 'abc', logger)

    expect(result).toBeNull()
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })

  it('[core] warns on query error', async () => {
    const payload = { find: vi.fn().mockRejectedValue(new Error('fail')) } as any
    const logger = { warn: vi.fn() }

    const result = await resolveCampaignIdFromRef(payload, 'abc', logger)

    expect(result).toBeNull()
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
})
