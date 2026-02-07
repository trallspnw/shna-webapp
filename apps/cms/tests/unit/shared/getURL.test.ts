import { describe, expect, it, vi } from 'vitest'

import { resolveCMSURL } from '@shna/shared/utilities/getURL'

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

  it('[core] falls back to same-origin when resolved base is localhost in browser', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const resolved = resolveCMSURL({
      isBrowser: true,
      hostname: 'seminaryhillnaturalarea.org',
      origin: 'https://seminaryhillnaturalarea.org',
      env: { NEXT_PUBLIC_CMS_URL: 'http://localhost:3000' },
    })

    expect(resolved).toBe('https://seminaryhillnaturalarea.org')
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
