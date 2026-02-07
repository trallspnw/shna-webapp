import { describe, expect, it, vi } from 'vitest'

import { getPublicApiBaseUrl, resolveCMSURL } from '@shna/shared/utilities/getURL'

describe('resolveCMSURL', () => {
  it('[core] uses cms origin when browsing CMS domain', () => {
    const resolved = resolveCMSURL({
      isBrowser: true,
      hostname: 'cms.seminaryhillnaturalarea.org',
      origin: 'https://cms.seminaryhillnaturalarea.org',
      env: { NEXT_PUBLIC_CMS_URL: 'http://localhost:3000' },
    })

    expect(resolved).toBe('https://cms.seminaryhillnaturalarea.org')
  })

  it('[core] uses NEXT_PUBLIC_CMS_URL on public site and strips trailing slash', () => {
    const resolved = resolveCMSURL({
      isBrowser: true,
      hostname: 'seminaryhillnaturalarea.org',
      origin: 'https://seminaryhillnaturalarea.org',
      env: { NEXT_PUBLIC_CMS_URL: 'https://cms.seminaryhillnaturalarea.org/' },
    })

    expect(resolved).toBe('https://cms.seminaryhillnaturalarea.org')
  })

  it('[core] prefers production CMS URL on public site domain even if env points to localhost', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const resolved = resolveCMSURL({
      isBrowser: true,
      hostname: 'seminaryhillnaturalarea.org',
      origin: 'https://seminaryhillnaturalarea.org',
      env: { NEXT_PUBLIC_CMS_URL: 'http://localhost:3000' },
    })

    expect(resolved).toBe('https://cms.seminaryhillnaturalarea.org')
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})

describe('getPublicApiBaseUrl', () => {
  it('[core] uses cms origin when browsing CMS domain', () => {
    const resolved = getPublicApiBaseUrl({
      isBrowser: true,
      hostname: 'cms.seminaryhillnaturalarea.org',
      origin: 'https://cms.seminaryhillnaturalarea.org',
      env: { NEXT_PUBLIC_CMS_URL: 'https://cms.seminaryhillnaturalarea.org' },
    })

    expect(resolved).toBe('https://cms.seminaryhillnaturalarea.org')
  })

  it('[core] uses NEXT_PUBLIC_CMS_URL on public site domain', () => {
    const resolved = getPublicApiBaseUrl({
      isBrowser: true,
      hostname: 'seminaryhillnaturalarea.org',
      origin: 'https://seminaryhillnaturalarea.org',
      env: { NEXT_PUBLIC_CMS_URL: 'https://cms.seminaryhillnaturalarea.org' },
    })

    expect(resolved).toBe('https://cms.seminaryhillnaturalarea.org')
  })

  it('[core] allows localhost when running on localhost', () => {
    const prevCmsUrl = process.env.NEXT_PUBLIC_CMS_URL
    const prevCmsPublicUrl = process.env.CMS_PUBLIC_URL
    delete process.env.NEXT_PUBLIC_CMS_URL
    delete process.env.CMS_PUBLIC_URL

    const resolved = getPublicApiBaseUrl({
      isBrowser: true,
      hostname: 'localhost',
      origin: 'http://localhost:3001',
      env: {},
    })

    expect(resolved).toBe('http://localhost:3001')
    if (typeof prevCmsUrl === 'string') {
      process.env.NEXT_PUBLIC_CMS_URL = prevCmsUrl
    }
    if (typeof prevCmsPublicUrl === 'string') {
      process.env.CMS_PUBLIC_URL = prevCmsPublicUrl
    }
  })

  it('[core] prefers NEXT_PUBLIC_CMS_URL on localhost when configured', () => {
    const resolved = getPublicApiBaseUrl({
      isBrowser: true,
      hostname: 'localhost',
      origin: 'http://localhost:3001',
      env: { NEXT_PUBLIC_CMS_URL: 'https://cms.seminaryhillnaturalarea.org' },
    })

    expect(resolved).toBe('https://cms.seminaryhillnaturalarea.org')
  })
})
