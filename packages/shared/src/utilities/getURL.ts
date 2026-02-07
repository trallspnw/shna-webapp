import canUseDOM from './canUseDOM'

type ResolveCMSURLOptions = {
  env?: Record<string, string | undefined>
  isBrowser?: boolean
  hostname?: string
  origin?: string
}

const normalizeOrigin = (url: string) => url.replace(/\/+$/, '')

const isCmsHostname = (hostname: string) =>
  hostname === 'cms.seminaryhillnaturalarea.org' || hostname.endsWith('.seminaryhillnaturalarea.org')

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

  let resolved =
    env.NEXT_PUBLIC_CMS_URL ||
    env.CMS_PUBLIC_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : origin || 'http://localhost:3000')

  if (isBrowser && /localhost|127\.0\.0\.1/.test(resolved)) {
    console.error('[cms-url] resolved to localhost in browser; falling back to same-origin.')
    resolved = origin || resolved
  }

  return normalizeOrigin(resolved)
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
