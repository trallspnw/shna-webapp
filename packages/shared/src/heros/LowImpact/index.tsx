import React from 'react'

import type { Page } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import RichText from '@shna/shared/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      locale?: Locale
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
      locale?: Locale
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-[48rem]">
        {children || (richText && <RichText data={richText} enableGutter={false} />)}
      </div>
    </div>
  )
}
