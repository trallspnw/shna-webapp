import { Block } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * Membership form block with localized text.
 */
export const MembershipDuesForm: Block = {
  slug: 'membershipDuesForm',
  interfaceName: 'MembershipDuesForm',
  labels: {
    singular: 'Membership Dues Form',
    plural: 'Membership Dues Form',
  },
  fields: [
    createLocalizedTextField('membershipTypeLabel', 'Membership Type Label'),
    createLocalizedTextField('membershipTypeIndividualLabel', 'Individual Label'),
    createLocalizedTextField('membershipTypeFamilyLabel', 'Family Label'),
    createLocalizedTextField('householdNameLabel', 'Household Name Label'),
    createLocalizedTextField('householdNamePlaceholder', 'Household Name Placeholder'),
    createLocalizedTextField('membersLabel', 'Members Label'),
    createLocalizedTextField('addMemberLabel', 'Add Member Label'),
    createLocalizedTextField('removeMemberLabel', 'Remove Member Label'),
    createLocalizedTextField('submitButtonText', 'Submit Button Text', true),
    createLocalizedTextField('priceLabel', 'Price Label', true),
    createLocalizedTextField('itemName', 'Item Name'),
    createLocalizedTextField('existingMembershipMessage', 'Existing Membership Message'),
    createLocalizedTextField('serverFailureMessage', 'Server Failure Message'),
  ],
}
