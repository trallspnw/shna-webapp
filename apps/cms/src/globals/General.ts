import { GlobalConfig } from 'payload'
import { createLocalizedTextField } from '../fields/localizedTextField'

/**
 * General global configuration model.
 */
export const GeneralGlobal: GlobalConfig = {
  slug: 'general',
  label: 'General',
  access: {
    read: () => true,
  },
  fields: [
    createLocalizedTextField('baseTitle', 'Base Title', true),
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
      label: 'Logo Image',
      required: true,
    },
    {
      name: 'icon',
      type: 'relationship',
      relationTo: 'media',
      label: 'Icon',
    },
    {
      type: 'group',
      name: 'membershipPrices',
      label: 'Membership Prices',
      fields: [
        {
          name: 'individual',
          type: 'number',
          label: 'Individual Price',
          required: true,
        },
        {
          name: 'family',
          type: 'number',
          label: 'Family Price',
          required: true,
        },
      ],
    },
    {
      name: 'maxHouseholdSize',
      type: 'number',
      label: 'Max Household Size',
      required: true,
    },
    {
      type: 'group',
      name: 'eventLabels',
      label: 'Event Labels',
      fields: [
        createLocalizedTextField('dateLabel', 'Date Label'),
        createLocalizedTextField('timeLabel', 'Time Label'),
        createLocalizedTextField('locationLabel', 'Location Label'),
      ],
    },
    {
      type: 'group',
      name: 'name',
      label: 'Name Input',
      fields: [
        createLocalizedTextField('nameLabel', 'Name Label'),
        createLocalizedTextField('namePlaceholder', 'Name Placeholder'),
        createLocalizedTextField('nameValidationError', 'Name Input Error'),
      ],
    },
    {
      type: 'group',
      name: 'email',
      label: 'Email Input',
      fields: [
        createLocalizedTextField('emailLabel', 'Email Label'),
        createLocalizedTextField('emailPlaceholder', 'Email Placeholder'),
        createLocalizedTextField('emailValidationError', 'Email Input Error'),
      ],
    },
    {
      type: 'group',
      name: 'phone',
      label: 'Phone Input',
      fields: [
        createLocalizedTextField('phoneLabel', 'Phone Label'),
        createLocalizedTextField('phonePlaceholder', 'Phone Placeholder'),
        createLocalizedTextField('phoneValidationError', 'Phone Input Error'),
      ],
    },
    {
      type: 'group',
      name: 'address',
      label: 'Address Input',
      fields: [
        createLocalizedTextField('addressLabel', 'Address Label'),
        createLocalizedTextField('addressPlaceholder', 'Address Placeholder'),
        createLocalizedTextField('addressValidationError', 'Address Input Error'),
      ],
    },
    {
      type: 'group',
      name: 'memberLabels',
      label: 'Member Labels',
      fields: [
        createLocalizedTextField('primaryMemberLabel', 'Primary Member Label'),
        createLocalizedTextField('additionalMemberLabel', 'Additional Member Label'),
      ],
    },
    {
      type: 'group',
      name: 'membershipForm',
      label: 'Membership Form Labels',
      fields: [
        createLocalizedTextField('detailsHeading', 'Details Heading'),
        createLocalizedTextField('memberOptionalHelp', 'Member Optional Help'),
      ],
    },
  ],
}
