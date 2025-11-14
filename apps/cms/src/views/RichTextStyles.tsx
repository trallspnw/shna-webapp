'use client'

import { useEffect } from 'react'

const STYLE_ELEMENT_ID = 'payload-lexical-styles'
const STYLE_HREF = '/payload-lexical.css?v=3.49.0'

/**
 * Injects the Lexical rich text stylesheet at runtime.
 */
export function RichTextStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ELEMENT_ID)) return

    const link = document.createElement('link')
    link.id = STYLE_ELEMENT_ID
    link.rel = 'stylesheet'
    link.href = STYLE_HREF
    document.head.appendChild(link)

    return () => {
      // Do not remove the stylesheet to avoid flicker when navigating within the admin UI.
    }
  }, [])

  return null
}
