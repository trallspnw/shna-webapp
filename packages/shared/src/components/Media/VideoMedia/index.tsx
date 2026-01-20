'use client'

import { cn } from '@shna/shared/utilities/ui'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl, getMediaUrlFromPrefix } from '@shna/shared/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, resource, videoClassName } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { filename, updatedAt, url } = resource
    const prefix = 'prefix' in resource ? (resource as { prefix?: string | null }).prefix : undefined
    const r2Url = getMediaUrlFromPrefix(prefix, filename, updatedAt)
    const src = r2Url || (url ? getMediaUrl(url, updatedAt) : getMediaUrl(`/media/${filename}`, updatedAt))

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
        ref={videoRef}
      >
        <source src={src} />
      </video>
    )
  }

  return null
}
