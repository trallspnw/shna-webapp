'use client'
import { useHeaderTheme } from '@shna/shared/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { CMSLink } from '@shna/shared/components/Link'
import { Media } from '@shna/shared/components/Media'
import RichText from '@shna/shared/components/RichText'

type Props = Page['hero'] & {
  locale?: Locale
}

export const HighImpactHero: React.FC<Props> = ({ links, media, richText, locale }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} locale={locale} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>
    </div>
  )
}
