import { getSessionRef, removeSessionRef, setSessionRef } from '../client/storage'

const REF_PARAM = 'ref'
const REF_PATTERN = /^[a-z0-9][a-z0-9-_]*$/
const REF_MAX_LEN = 64

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined'

const normalizeRef = (value: string): string => value.trim().toLowerCase().slice(0, REF_MAX_LEN)

const isValidRef = (value: string): boolean => REF_PATTERN.test(value)

const removeRefParamFromUrl = (url: URL): void => {
  if (!isBrowser()) return
  if (!url.searchParams.has(REF_PARAM)) return
  url.searchParams.delete(REF_PARAM)
  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(null, '', nextUrl)
}

const getExternalReferrerHost = (): string | null => {
  if (!isBrowser()) return null
  const referrer = document.referrer
  if (!referrer) return null

  try {
    const refUrl = new URL(referrer)
    const current = new URL(window.location.href)

    // Ignore internal navigation
    if (refUrl.origin === current.origin) return null

    return refUrl.hostname || null
  } catch {
    return null
  }
}

const deriveRefFromHost = (host: string): string =>
  host.toLowerCase().replace(/\./g, '-').slice(0, REF_MAX_LEN)

export const captureRefFromUrl = (): string | null => {
  if (!isBrowser()) return null

  const url = new URL(window.location.href)
  const hasRefParam = url.searchParams.has(REF_PARAM)
  const rawRef = url.searchParams.get(REF_PARAM)

  if (hasRefParam) {
    const normalized = normalizeRef(rawRef ?? '')
    if (normalized && isValidRef(normalized)) {
      setSessionRef(normalized)
      removeRefParamFromUrl(url)
      return getSessionRef() ?? null
    }
    // Always clean the URL if `ref` was present, even if invalid/empty
    removeRefParamFromUrl(url)
  }

  if (!getSessionRef()) {
    const referrerHost = getExternalReferrerHost()
    if (referrerHost) {
      const derived = deriveRefFromHost(referrerHost)
      if (derived && isValidRef(derived)) {
        setSessionRef(derived)
        return getSessionRef() ?? null
      }
    }
  }

  return getSessionRef() ?? null
}

export const getRef = (): string | null => {
  return getSessionRef() ?? null
}

export const clearRef = (): void => {
  removeSessionRef()
}
