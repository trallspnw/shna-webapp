import { describe, it, expect } from 'vitest'
import { parseAttribution } from '@/lib/attribution'

describe('attribution utils', () => {
  it('[core] parses flat params', () => {
    const params = {
      ref: 'abc',
      utm_source: 'google',
      utm_medium: 'cpc',
    }
    expect(parseAttribution(params)).toEqual({
      refRaw: 'abc',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
    })
  })

  it('[core] handles arrays (takes first)', () => {
    const params = {
      ref: ['abc', 'def'],
    }
    expect(parseAttribution(params)).toEqual({
      refRaw: 'abc',
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
    })
  })

  it('[core] returns nulls for missing', () => {
    expect(parseAttribution({})).toEqual({
      refRaw: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
    })
  })
})
