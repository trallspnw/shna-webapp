import { describe, it, expect, vi } from 'vitest'
import { normalizeEmail } from '@/lib/email/normalizeEmail'

describe('email utils', () => {
  it('[core] normalizeEmail', () => {
    expect(normalizeEmail('Test@Example.COM ')).toBe('test@example.com')
    expect(normalizeEmail('')).toBe('')
  })
})
