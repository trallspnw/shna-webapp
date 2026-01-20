import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import React from 'react'

import type { Footer } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { CMSLink } from '@shna/shared/components/Link'

type Props = {
  draft?: boolean
  headers?: HeadersInit
  locale?: Locale
}

export async function Footer({ draft = false, headers, locale }: Props = {}) {
  const footerData: Footer = await getCachedGlobal('footer', 1, draft, headers, locale)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-end">
        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} locale={locale} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
