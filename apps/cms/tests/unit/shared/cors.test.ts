import { describe, expect, it } from 'vitest'

import { buildCorsOrigins } from '@/utilities/cors'

describe('buildCorsOrigins', () => {
  it('[core] builds allowlist and normalizes origins', () => {
    const origins = buildCorsOrigins(
      {
        NEXT_PUBLIC_CMS_URL: 'https://cms.seminaryhillnaturalarea.org/',
        NEXT_PUBLIC_SITE_URL: 'https://seminaryhillnaturalarea.org/',
        CORS_ORIGINS: 'https://example.com, https://foo.bar/',
      },
      'production',
    )

    expect(origins).toContain('https://cms.seminaryhillnaturalarea.org')
    expect(origins).toContain('https://seminaryhillnaturalarea.org')
    expect(origins).toContain('https://www.seminaryhillnaturalarea.org')
    expect(origins).toContain('https://example.com')
    expect(origins).toContain('https://foo.bar')
  })
})
