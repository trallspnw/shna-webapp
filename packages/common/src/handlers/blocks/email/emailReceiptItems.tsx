import { JSX } from "react"
import { EmailReceiptItems as EmailReceiptItemsType } from '@common/types/payload-types' 
import { Language } from "../../../types/language"
import { resolveLocalizedText } from '../../../lib/translation'

/**
 * Handles rendering of email receipt items blocks. Uses itemName and amount params.
 */
export function render(
  block: EmailReceiptItemsType, 
  index: number, 
  language: Language,
  params: Record<string, string>,
): JSX.Element {

  const { itemName, amount } = params ?? {}

  if (!itemName || !amount) {
    return (
      <p key={index}>
        {resolveLocalizedText(block.missingDetailsText, language)}
      </p>
    )
  }

  return (
    <ul key={index}>
      <li>{itemName}: {amount}</li>
    </ul>
  )
}
