import React from 'react'

import type { Page } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { CMSLink } from '@shna/shared/components/Link'
import { Media } from '@shna/shared/components/Media'
import RichText from '@shna/shared/components/RichText'

type Props = Page['hero'] & {
  locale?: Locale
}

export const HighImpactHero: React.FC<Props> = ({ links, media, richText, locale }) => {
  return (
    <section
      className="relative flex min-h-[90vh] items-end"
      aria-label="Hero"
      // Full-bleed breakout + cancel the article's pt-16 so the hero touches the nav
      style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginTop: '-4rem' }}
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
      )}

      {/* Bottom-to-top gradient overlay so text reads cleanly */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
        aria-hidden="true"
      />

      {/* Hero content — bottom-left aligned */}
      <div className="relative z-10 w-full px-4 pb-16 pt-32 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-[86rem]">
          {richText && (
            // data-theme="dark" activates dark:prose-invert in the RichText component
            <div data-theme="dark" className="max-w-xl mb-8">
              <RichText data={richText} enableGutter={false} />
            </div>
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4" role="list">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink
                    {...link}
                    locale={locale}
                    appearance="inline"
                    className="inline-block rounded-lg bg-primary px-8 py-3 font-sans text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
