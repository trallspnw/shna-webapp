import canUseDOM from '../utilities/canUseDOM'

export const LOCALE_STORAGE_KEY = 'shna-locale'
export const REF_STORAGE_KEY = 'ref'

type StorageType = 'local' | 'session'

const getStorage = (type: StorageType): Storage | null => {
  if (!canUseDOM) return null
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export const getStoredLocale = (): string | undefined => {
  const storage = getStorage('local')
  return storage?.getItem(LOCALE_STORAGE_KEY) ?? undefined
}

export const setStoredLocale = (locale: string): void => {
  const storage = getStorage('local')
  if (!storage) return
  storage.setItem(LOCALE_STORAGE_KEY, locale)
}

export const ensureStoredLocale = (locale: string): void => {
  const current = getStoredLocale()
  if (current === locale) return
  setStoredLocale(locale)
}

export const getSessionRef = (): string | undefined => {
  const storage = getStorage('session')
  return storage?.getItem(REF_STORAGE_KEY) ?? undefined
}

export const setSessionRef = (ref: string): void => {
  const storage = getStorage('session')
  if (!storage) return
  storage.setItem(REF_STORAGE_KEY, ref)
}

export const removeSessionRef = (): void => {
  const storage = getStorage('session')
  if (!storage) return
  storage.removeItem(REF_STORAGE_KEY)
}
