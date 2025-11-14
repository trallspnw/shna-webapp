import { JSX } from "react"
import { EmailParagraph as EmailParagraphType } from '@common/types/payload-types' 
import { Language } from "../../../types/language"
import { resolveLocalizedText } from '../../../lib/translation'

/**
 * Handles rendering of email paragraph blocks.
 */
export function render(
  block: EmailParagraphType, 
  index: number, 
  language: Language,
  params: Record<string, string>,
): JSX.Element {

  return (
    <p key={index}>
      {resolveLocalizedText(block.text, language)}
    </p>
  )
}
