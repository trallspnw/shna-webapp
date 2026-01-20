import { getClientSideURL, getCMSURL } from '@shna/shared/utilities/getURL'

const normalizeMediaBaseUrl = (): string | undefined => {
  if (process.env.NEXT_PUBLIC_MEDIA_URL) {
    return process.env.NEXT_PUBLIC_MEDIA_URL.replace(/\/$/, '')
  }

  const mediaOrigin = getMediaOrigin()
  if (!mediaOrigin) return undefined

  const r2Prefix = process.env.R2_PREFIX || 'local'
  return `${mediaOrigin}/${r2Prefix}/media`
}

export const getMediaOrigin = (): string | undefined => {
  const origin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN
  return origin ? origin.replace(/\/$/, '') : undefined
}

export const getMediaUrlFromPrefix = (
  prefix: string | null | undefined,
  filename: string | null | undefined,
  cacheTag?: string | null,
): string | undefined => {
  if (!prefix || !filename) return undefined
  const origin = getMediaOrigin()
  if (!origin) return undefined

  const normalizedPrefix = prefix.replace(/^\/+/, '').replace(/\/$/, '')
  let url = `${origin}/${normalizedPrefix}/${filename}`
  if (cacheTag && cacheTag !== '') {
    url += `${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(cacheTag)}`
  }
  return url
}

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  const isAbsolute = url.startsWith('http://') || url.startsWith('https://')
  const hasApiMediaPath = url.includes('/api/media/file/')
  const cmsOrigin = getCMSURL()
  let normalizedUrl = url

  if (isAbsolute && cmsOrigin && url.startsWith(cmsOrigin)) {
    normalizedUrl = url.slice(cmsOrigin.length) || '/'
  }

  if (hasApiMediaPath) {
    // Prefer external media origin when available; fallback to local static path.
    const withoutOrigin = normalizedUrl.replace(/^https?:\/\/[^/]+/, '')
    const mediaBaseUrl = normalizeMediaBaseUrl()
    if (mediaBaseUrl) {
      normalizedUrl = `${mediaBaseUrl}/${withoutOrigin.replace('/api/media/file/', '')}`
    } else {
      normalizedUrl = withoutOrigin.replace('/api/media/file/', '/media/')
    }
  }

  if (normalizedUrl.startsWith('/media/')) {
    const mediaBaseUrl = normalizeMediaBaseUrl()
    if (mediaBaseUrl) {
      normalizedUrl = `${mediaBaseUrl}${normalizedUrl.replace('/media', '')}`
    }
  }

  if (normalizedUrl.startsWith('/')) {
    // Avoid query params on relative paths; Next image does not encode "?" in the url param.
    return normalizedUrl
  }

  if (isAbsolute && !hasApiMediaPath) {
    if (!cacheTag) return normalizedUrl
    return `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}v=${cacheTag}`
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  if (!cacheTag) return `${baseUrl}${normalizedUrl}`
  return `${baseUrl}${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}v=${cacheTag}`
}
