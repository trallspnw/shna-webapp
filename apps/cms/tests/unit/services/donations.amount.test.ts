import { describe, expect, it } from 'vitest'

import { parseAmountUSD, enforceMaxDonationUSD } from '@/services/donations/amount'
import { ValidationError } from '@/services/donations/types'

describe('donations amount parsing', () => {
  it('[core] parses integer and decimal amounts', () => {
    expect(parseAmountUSD('10').amountCents).toBe(1000)
    expect(parseAmountUSD('10.5').amountCents).toBe(1050)
    expect(parseAmountUSD('10.50').amountCents).toBe(1050)
    expect(parseAmountUSD(12.34).amountCents).toBe(1234)
  })

  it('[core] rejects invalid formats and non-positive values', () => {
    expect(() => parseAmountUSD('')).toThrow(ValidationError)
    expect(() => parseAmountUSD('10.999')).toThrow(ValidationError)
    expect(() => parseAmountUSD('abc')).toThrow(ValidationError)
    expect(() => parseAmountUSD(0)).toThrow(ValidationError)
  })

  it('[core] enforces max donation', () => {
    expect(() => enforceMaxDonationUSD(100, 50)).toThrow(ValidationError)
    expect(() => enforceMaxDonationUSD(50, 50)).not.toThrow()
  })
})
