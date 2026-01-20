import React from 'react'
import { DEFAULT_LOCALE } from '@shna/shared/utilities/locale'

export default function BridgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
