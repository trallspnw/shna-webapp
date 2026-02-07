import canUseDOM from './canUseDOM'

type ResolveCMSURLOptions = {
  env?: Record<string, string | undefined>
  isBrowser?: boolean
  hostname?: string
  origin?: string
}

type ResolvePublicApiOptions = ResolveCMSURLOptions

const normalizeOrigin = (url: string) => url.replace(/\/+$/, '')
const isLocalhostHostname = (hostname: string) => /localhost|127\.0\.0\.1/.test(hostname)

const isCmsHostname = (hostname: string) =>
  hostname === 'cms.seminaryhillnaturalarea.org' || hostname.endsWith('.seminaryhillnaturalarea.org')

const PRODUCTION_CMS_URL = 'https://cms.seminaryhillnaturalarea.org'
const isProductionSiteHostname = (hostname: string) =>
  hostname === 'seminaryhillnaturalarea.org' || hostname.endsWith('.seminaryhillnaturalarea.org')

const resolvePublicEnvCMSURL = (env?: Record<string, string | undefined>) => {
  return (
    env?.NEXT_PUBLIC_CMS_URL ||
    env?.CMS_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_CMS_URL ||
    process.env.CMS_PUBLIC_URL
  )
}

export const resolveCMSURL = (options: ResolveCMSURLOptions = {}) => {
  const env = options.env ?? process.env
  const isBrowser = options.isBrowser ?? canUseDOM
  const hostname = options.hostname ?? (isBrowser ? window.location.hostname : undefined)
  const origin = options.origin ?? (isBrowser ? window.location.origin : undefined)

  if (!isBrowser && env.CMS_INTERNAL_URL) {
    return normalizeOrigin(env.CMS_INTERNAL_URL)
  }

  if (isBrowser && hostname && origin && isCmsHostname(hostname)) {
    return normalizeOrigin(origin)
  }

  if (isBrowser && hostname && isProductionSiteHostname(hostname)) {
    return normalizeOrigin(PRODUCTION_CMS_URL)
  }

  const envCMSURL = resolvePublicEnvCMSURL(env)

  if (isBrowser && !envCMSURL && hostname && /localhost|127\.0\.0\.1/.test(hostname)) {
    return 'http://localhost:3000'
  }

  let resolved =
    envCMSURL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : origin || 'http://localhost:3000')

  if (isBrowser && !envCMSURL && /localhost|127\.0\.0\.1/.test(resolved)) {
    console.error('[cms-url] resolved to localhost in browser; falling back to same-origin.')
    resolved = origin || resolved
  }

  return normalizeOrigin(resolved)
}

export const getPublicApiBaseUrl = (options: ResolvePublicApiOptions = {}) => {
  const env = options.env ?? process.env
  const isBrowser = options.isBrowser ?? canUseDOM
  const hostname = options.hostname ?? (isBrowser ? window.location.hostname : undefined)
  const origin = options.origin ?? (isBrowser ? window.location.origin : undefined)
  const envCMSURL = resolvePublicEnvCMSURL(env)

  if (isBrowser && hostname && origin && isCmsHostname(hostname)) {
    return normalizeOrigin(origin)
  }

  if (isBrowser && hostname && isLocalhostHostname(hostname)) {
    if (envCMSURL) return normalizeOrigin(envCMSURL)
    return normalizeOrigin(origin || 'http://localhost:3000')
  }

  if (isBrowser && hostname) {
    if (!envCMSURL) {
      console.error('[public-api] NEXT_PUBLIC_CMS_URL is required on non-localhost hosts.')
      throw new Error('NEXT_PUBLIC_CMS_URL is required for public API requests.')
    }
    const normalized = normalizeOrigin(envCMSURL)
    if (isLocalhostHostname(normalized)) {
      console.warn('[public-api] resolved to localhost on non-local host; refusing to use localhost.')
      throw new Error('Public API base cannot be localhost on non-localhost host.')
    }
    return normalized
  }

  if (envCMSURL) return normalizeOrigin(envCMSURL)
  return normalizeOrigin(origin || 'http://localhost:3000')
}

export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_CMS_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  )
}

export const getSiteURL = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || getServerSideURL()
}

export const getCMSURL = () => {
  return resolveCMSURL()
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return process.env.NEXT_PUBLIC_CMS_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''
}
