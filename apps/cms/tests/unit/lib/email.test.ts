import { describe, it, expect, vi } from 'vitest'
import { normalizeEmail, getActiveMembershipByEmail, isRenewable } from '@/lib/email'
import { Payload } from 'payload'

describe('email utils', () => {
  it('normalizeEmail', () => {
    expect(normalizeEmail('Test@Example.COM ')).toBe('test@example.com')
    expect(normalizeEmail('')).toBe('')
  })

  describe('getActiveMembershipByEmail', () => {
    it('returns inactive if no contact found', async () => {
      const mockPayload = {
        find: vi.fn().mockResolvedValue({ docs: [] }),
      } as unknown as Payload

      const result = await getActiveMembershipByEmail(mockPayload, 'unknown@test.com')
      expect(result).toEqual({ isActive: false })
      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ collection: 'contacts' }),
      )
    })

    // More complex mocking would happen in integration tests really,
    // as mocking deeply nested relations is tedious.
    // We will rely on simple unit logic + full integration tests.
  })

  describe('isRenewable', () => {
    const plan = { renewalWindowDays: 30 } as any

    it('true if now is within window', () => {
      const expires = new Date('2024-01-31')
      // Window starts Jan 1.
      const now = new Date('2024-01-02')
      const term = { expiresAt: expires.toISOString() } as any
      expect(isRenewable(term, plan, now)).toBe(true)
    })

    it('false if now is before window', () => {
      const expires = new Date('2024-01-31')
      // Window starts Jan 1.
      const now = new Date('2023-12-31')
      const term = { expiresAt: expires.toISOString() } as any
      expect(isRenewable(term, plan, now)).toBe(false)
    })
  })
})
