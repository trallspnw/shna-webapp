import { Block } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * A blcok to show purchased items. Used in emails.
 */
export const EmailReceiptItems: Block = {
  slug: 'emailReceiptItems',
  interfaceName: 'EmailReceiptItems',
  labels: {
    singular: 'Email Receipt Items',
    plural: 'Email Receipt Items',
  },
  fields: [
    createLocalizedTextField('missingDetailsText', 'Missing Details Text', true),
  ],
}
