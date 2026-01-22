import React from 'react'
import { DEFAULT_LOCALE } from '@shna/shared/utilities/locale'

import { FrontEndShell } from '../(frontend)/FrontEndShell'

export default async function BridgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <FrontEndShell locale={DEFAULT_LOCALE} localeInitMode="ifMissing">
      {children}
    </FrontEndShell>
  )
}
