import React from 'react'

import RichText from '@shna/shared/components/RichText'
import type { RichTextBlock as RichTextBlockProps } from '@shna/shared/payload-types'

type Props = RichTextBlockProps

export const RichTextBlock: React.FC<Props> = ({ richText }) => {
  if (!richText) return null
  return <RichText data={richText} enableGutter={false} />
}
