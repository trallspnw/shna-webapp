type EnvLike = Record<string, string | undefined>

const PROD_ORIGINS = [
  'https://seminaryhillnaturalarea.org',
  'https://www.seminaryhillnaturalarea.org',
  'https://cms.seminaryhillnaturalarea.org',
]

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]

const normalizeOrigin = (origin: string): string | null => {
  const trimmed = origin.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    return `${url.protocol}//${url.host}`
  } catch {
    return null
  }
}

const withWww = (origin: string): string | null => {
  try {
    const url = new URL(origin)
    if (url.hostname === 'seminaryhillnaturalarea.org') {
      return `${url.protocol}//www.${url.hostname}`
    }
  } catch {
    return null
  }
  return null
}

export const buildCorsOrigins = (
  env: EnvLike = process.env,
  nodeEnv = process.env.NODE_ENV,
): string[] => {
  const rawOrigins: string[] = []

  if (env.CORS_ORIGINS) {
    rawOrigins.push(
      ...env.CORS_ORIGINS.split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
  }

  if (env.NEXT_PUBLIC_SITE_URL) rawOrigins.push(env.NEXT_PUBLIC_SITE_URL)
  if (env.NEXT_PUBLIC_CMS_URL) rawOrigins.push(env.NEXT_PUBLIC_CMS_URL)
  if (env.CMS_PUBLIC_URL) rawOrigins.push(env.CMS_PUBLIC_URL)

  rawOrigins.push(...PROD_ORIGINS)

  if (nodeEnv !== 'production') {
    rawOrigins.push(...DEV_ORIGINS)
  }

  const normalized = rawOrigins
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin))

  const expanded = normalized.flatMap((origin) => {
    const wwwVariant = withWww(origin)
    return wwwVariant ? [origin, wwwVariant] : [origin]
  })

  return Array.from(new Set(expanded))
}
