import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/subscriptions/service', () => ({
  subscribe: vi.fn(),
  unsubscribeAll: vi.fn(),
}))

import { subscriptionsHandler } from '@/endpoints/subscriptions'
import { subscribe, unsubscribeAll } from '@/services/subscriptions/service'

const makeReq = (body: unknown) => ({
  json: async () => body,
  payload: {
    logger: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    },
  },
})

describe('subscriptions endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('[core] subscribe happy-path returns ok', async () => {
    ;(subscribe as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true })

    const res = await subscriptionsHandler(
      makeReq({ action: 'subscribe', email: 'test@example.com', topics: ['general'] }) as any,
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(subscribe).toHaveBeenCalledTimes(1)
  })

  it('[core] missing action returns 400', async () => {
    const res = await subscriptionsHandler(makeReq({ email: 'test@example.com' }) as any)

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] missing email returns 400', async () => {
    const res = await subscriptionsHandler(
      makeReq({ action: 'subscribe', topics: ['general'] }) as any,
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] missing topics returns 400', async () => {
    const res = await subscriptionsHandler(
      makeReq({ action: 'subscribe', email: 'test@example.com' }) as any,
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] update returns 400', async () => {
    const res = await subscriptionsHandler(
      makeReq({ action: 'update', email: 'test@example.com', topics: ['general'] }) as any,
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' })
  })

  it('[core] unsubscribeAll unknown email returns ok', async () => {
    ;(unsubscribeAll as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true })

    const res = await subscriptionsHandler(
      makeReq({ action: 'unsubscribeAll', email: 'unknown@example.com' }) as any,
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(unsubscribeAll).toHaveBeenCalledTimes(1)
  })
})
