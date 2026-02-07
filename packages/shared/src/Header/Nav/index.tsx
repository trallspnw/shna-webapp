'use client'

import React from 'react'

import type { Header as HeaderType } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { CMSLink } from '@shna/shared/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType; locale?: Locale }> = ({ data, locale }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-4 items-center">
      {/* TEMP: hard-coded Home link until logo is ready. */}
      <CMSLink
        appearance="link"
        className="text-lg font-semibold no-underline hover:no-underline"
        label="Home"
        locale={locale}
        type="custom"
        url="/"
      />
      {/* TEMP: remove once logo is in place. */}
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" locale={locale} />
      })}
      {/* TEMP: hide language toggle while translations are on hold. */}
    </nav>
  )
}
