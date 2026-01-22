import React from 'react'
import { DEFAULT_LOCALE } from '@shna/shared/utilities/locale'

import '../(site)/globals.css'
import { SiteShell } from '../(site)/SiteShell'

export default async function BridgeLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale={DEFAULT_LOCALE} localeInitMode="ifMissing">{children}</SiteShell>
}
