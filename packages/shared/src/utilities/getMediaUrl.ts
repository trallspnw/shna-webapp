import { getClientSideURL, getCMSURL } from '@shna/shared/utilities/getURL'

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
    // Use static media path so exported sites do not depend on CMS runtime routes.
    const withoutOrigin = normalizedUrl.replace(/^https?:\/\/[^/]+/, '')
    normalizedUrl = withoutOrigin.replace('/api/media/file/', '/media/')
  }

  if (normalizedUrl.startsWith('/')) {
    return cacheTag ? `${normalizedUrl}?${cacheTag}` : normalizedUrl
  }

  if (isAbsolute && !hasApiMediaPath) {
    return cacheTag ? `${normalizedUrl}?${cacheTag}` : normalizedUrl
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${normalizedUrl}?${cacheTag}` : `${baseUrl}${normalizedUrl}`
}
