import type { Block } from 'payload'

export const MembershipBlock: Block = {
  slug: 'membershipBlock',
  fields: [
    {
      name: 'header',
      type: 'text',
      label: 'Header Text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Join',
    },
    {
      name: 'nameLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Name',
    },
    {
      name: 'emailLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Email',
    },
    {
      name: 'phoneLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Phone',
    },
    {
      name: 'addressLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Address',
    },
    {
      name: 'planLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Plan',
    },
    {
      name: 'plans',
      type: 'relationship',
      relationTo: 'membershipPlans',
      hasMany: true,
      required: true,
      validate: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one plan is required.'
        }
        return true
      },
    },
    {
      name: 'defaultPlan',
      type: 'relationship',
      relationTo: 'membershipPlans',
      validate: (value: unknown, { siblingData }: { siblingData?: { plans?: unknown } }) => {
        if (!value) return true
        const plans = siblingData?.plans
        if (!Array.isArray(plans) || plans.length === 0) {
          return 'Default plan must be one of the selected plans.'
        }

        const ids = plans.map((plan: any) => (typeof plan === 'object' && plan ? plan.id : plan))
        return ids.includes(value) ? true : 'Default plan must be one of the selected plans.'
      },
    },
    {
      name: 'modalTitle',
      type: 'text',
      localized: true,
      defaultValue: 'Processing your membership...',
    },
    {
      name: 'loadingText',
      type: 'text',
      localized: true,
      defaultValue: 'Submitting your membership...',
    },
    {
      name: 'successText',
      type: 'text',
      localized: true,
      defaultValue: 'Thank you for becoming a member.',
    },
    {
      name: 'errorText',
      type: 'text',
      localized: true,
      defaultValue: 'Something went wrong. Please try again.',
    },
    {
      name: 'checkoutName',
      type: 'text',
      localized: true,
      admin: {
        description: 'Shown in Stripe checkout line items.',
      },
    },
    {
      name: 'closeLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Close',
    },
  ],
}
