import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@shna/shared/payload-types'

import { ThemeSelector } from '@shna/shared/providers/Theme/ThemeSelector'
import { CMSLink } from '@shna/shared/components/Link'
import { Logo } from '@shna/shared/components/Logo/Logo'

type Props = {
  draft?: boolean
  headers?: HeadersInit
}

export async function Footer({ draft = false, headers }: Props = {}) {
  const footerData: Footer = await getCachedGlobal('footer', 1, draft, headers)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
