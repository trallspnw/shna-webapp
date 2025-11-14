import { JSX } from 'react'
import { LocalizedRichText } from '@common/components/LocalizedRichText'
import { RichTextBlock } from '@common/types/payload-types'

/**
 * Render a localized rich text block.
 */
export function render(block: RichTextBlock, index: number): JSX.Element {
  return <LocalizedRichText key={index} value={block.content} />
}
