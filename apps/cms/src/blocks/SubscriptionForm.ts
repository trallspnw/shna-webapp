import { Block } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * Subscription form with localized text.
 */
export const SubscriptionForm: Block = {
  slug: 'subscriptionForm',
  interfaceName: 'SubscriptionForm',
  labels: {
    singular: 'Subscription Form',
    plural: 'Subscription Forms',
  },
  fields: [
    createLocalizedTextField('submitButtonText', 'Submit Button Text', true),
    {
      type: 'row',
      fields: [
        createLocalizedTextField('successHeading', 'Success Heading', true),
        createLocalizedTextField('successMessage', 'Success Message', true),
      ],
    },
    {
      type: 'row',
      fields: [
        createLocalizedTextField('failureHeading', 'Failure Heading', true),
        createLocalizedTextField('failureMessage', 'Failure Message', true),
      ],
    },
  ],
}
