import type { Payload } from 'payload'

export type Logger = {
  warn: (message: string, meta?: Record<string, unknown>) => void
}

const REF_PATTERN = /^[a-z0-9][a-z0-9-_]*$/

export const resolveCampaignIdFromRef = async (
  payload: Payload,
  ref?: string | null,
  logger?: Logger,
): Promise<string | number | null> => {
  if (ref === null || typeof ref === 'undefined') return null

  const normalized = ref.trim().toLowerCase()
  if (!normalized) return null
  if (!REF_PATTERN.test(normalized)) return null

  try {
    const result = await payload.find({
      collection: 'campaigns',
      limit: 1,
      depth: 0,
      where: {
        reftag: {
          equals: normalized,
        },
      },
    })

    const doc = result?.docs?.[0]
    if (!doc) {
      logger?.warn('Campaign ref could not be resolved.', { ref: normalized })
      return null
    }

    return (doc as { id?: string | number }).id ?? null
  } catch (error) {
    logger?.warn('Campaign ref lookup failed.', {
      ref: normalized,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}
