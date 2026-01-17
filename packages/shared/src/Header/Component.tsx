import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import React from 'react'

import type { Header } from '@shna/shared/payload-types'

type Props = {
  draft?: boolean
  headers?: HeadersInit
}

export async function Header({ draft = false, headers }: Props = {}) {
  const headerData: Header = await getCachedGlobal('header', 1, draft, headers)()

  return <HeaderClient data={headerData} />
}
