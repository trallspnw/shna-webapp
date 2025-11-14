import { Block } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * A form block for looking up membership status. Includes localized text.
 */
export const MembershipStatusForm: Block = {
  slug: 'membershipStatusForm',
  interfaceName: 'MembershipStatusForm',
  labels: {
    singular: 'Membership Status Form',
    plural: 'Membership Status Forms',
  },
  fields: [
    createLocalizedTextField('submitButtonText', 'Submit Button Text', true),
    {
      type: 'row',
      fields: [
        createLocalizedTextField('successHeading', 'Success Heading', true),
        createLocalizedTextField('membershipStatus', 'Membership Status', true),
        createLocalizedTextField('active', 'Active', true),
        createLocalizedTextField('inactive', 'Inactive', true),
        createLocalizedTextField('expires', 'Expires', true),
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
