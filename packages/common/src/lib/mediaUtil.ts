import { Language, LocalizedMedia } from '../types/language'
import { Media } from '../types/payload-types'

const app = process.env.APP_ENV

/**
 * Build a public media URL suitable for the current runtime environment.
 */
export function toPublicMediaUrl(url: string) {
  if (app === 'site') {
    return url.replace(/^\/api\/mediaFiles\/file/, '/mediaFiles')
  }
  return url
}

/**
 * Convert Payload's media shape into the app's LocalizedMedia structure.
 */
export function createLocalizedMedia(media: number | Media | null | undefined): LocalizedMedia {
  if (!media || typeof media === 'number') {
    return {}
  }

  const result: LocalizedMedia = {}

  for (const language of Object.keys(media.media ?? {}) as Language[]) {
    const file = media.media?.[language]
    const alt = media.altText?.[language] ?? null

    if (file && typeof file !== 'number') {
      result[language] = {
        file: file,
        src: file.url ?? '',
        alt: alt || undefined,
      }
    } else {
      result[language] = null
    }
  }

  return result
}
