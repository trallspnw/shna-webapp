'use client'

import { useEffect } from 'react'

import { captureRefFromUrl } from '@shna/shared/attribution/ref'

export const RefCapture = (): null => {
  useEffect(() => {
    captureRefFromUrl()
  }, [])

  return null
}
