'use client'

import React from 'react'

import type { Header as HeaderType } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { CMSLink } from '@shna/shared/components/Link'
import { LanguageToggle } from '@shna/shared/components/LanguageToggle'

export const HeaderNav: React.FC<{ data: HeaderType; locale?: Locale }> = ({ data, locale }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-4 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" locale={locale} />
      })}
      <LanguageToggle locale={locale} />
    </nav>
  )
}
