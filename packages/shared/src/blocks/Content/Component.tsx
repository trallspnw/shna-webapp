import { cn } from '@shna/shared/utilities/ui'
import React from 'react'
import RichText from '@shna/shared/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { CMSLink } from '../../components/Link'

type Props = ContentBlockProps & {
  locale?: Locale
}

export const ContentBlock: React.FC<Props> = (props) => {
  const { columns, locale } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} locale={locale} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
