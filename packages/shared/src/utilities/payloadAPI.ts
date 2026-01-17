import { getCMSURL } from './getURL'

type FetchOptions = {
  cache?: RequestCache
  depth?: number
  draft?: boolean
  headers?: HeadersInit
  params?: Record<string, string | number | boolean | undefined>
}

const buildURL = (path: string, params?: FetchOptions['params'], draft?: boolean) => {
  const url = new URL(path, getCMSURL())

  if (draft) {
    url.searchParams.set('draft', 'true')
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

export const fetchFromCMS = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
  const { cache, depth, draft, headers, params } = options
  const url = buildURL(path, { ...params, depth }, draft)

  const response = await fetch(url, {
    headers,
    cache: draft ? 'no-store' : cache ?? 'force-cache',
  })

  if (!response.ok) {
    throw new Error(`CMS request failed (${response.status}) for ${url}`)
  }

  return (await response.json()) as T
}
