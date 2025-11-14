import { Block } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * Donation form block with localized text.
 */
export const DonationForm: Block = {
  slug: 'donationForm',
  interfaceName: 'DonationForm',
  labels: {
    singular: 'Donation Form',
    plural: 'Donation Forms',
  },
  fields: [
    createLocalizedTextField('submitButtonText', 'Submit Button Text', true),
    createLocalizedTextField('amountLabel', 'Amount Label'),
    createLocalizedTextField('amountPlaceholder', 'Amount Placeholder'),
    createLocalizedTextField('amountValidationError', 'Amount Input Error'),
    createLocalizedTextField('itemName', 'Item Name'),
    createLocalizedTextField('serverFailureMessage', 'Server Failure Message'),
  ],
}
