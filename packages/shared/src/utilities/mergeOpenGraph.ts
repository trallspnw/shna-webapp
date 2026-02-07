import type { Metadata } from 'next'

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  if (!og) {
    return {}
  }

  const merged = { ...og }

  if (!og.images) {
    delete merged.images
  }

  return merged
}
