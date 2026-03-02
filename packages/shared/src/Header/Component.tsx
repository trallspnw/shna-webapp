import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import React from 'react'

import type { Header } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

type Props = {
  draft?: boolean
  headers?: HeadersInit
  locale?: Locale
}

export async function Header({ draft = false, headers, locale }: Props = {}) {
  let headerData: Header | null = null
  try {
    headerData = await getCachedGlobal('header', 1, draft, headers, locale)()
  } catch {
    // CMS temporarily unreachable; render with defaults
  }

  return <HeaderClient data={headerData ?? ({} as Header)} locale={locale} />
}
