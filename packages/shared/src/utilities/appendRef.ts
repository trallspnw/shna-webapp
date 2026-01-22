const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z0-9+.-]*:/
const FALLBACK_ORIGIN = 'http://local.invalid'

export const appendRef = (url: string, refValue: string): string => {
  if (!url || !refValue) return url

  try {
    const isAbsolute = ABSOLUTE_URL.test(url)
    const parsed = new URL(url, isAbsolute ? undefined : FALLBACK_ORIGIN)

    parsed.searchParams.set('ref', refValue)
    const encodedRef = encodeURIComponent(refValue)
    const search = parsed.searchParams
      .toString()
      .replace(`ref=${encodedRef}`, `ref=${refValue}`)
    parsed.search = search ? `?${search}` : ''

    if (isAbsolute) {
      return parsed.toString()
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return url
  }
}
