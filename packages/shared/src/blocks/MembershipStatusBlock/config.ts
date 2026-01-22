import type { Block } from 'payload'

export const MembershipStatusBlock: Block = {
  slug: 'membershipStatusBlock',
  fields: [
    {
      name: 'instructionText',
      type: 'text',
      defaultValue: 'Enter your email to check your membership status.',
    },
  ],
}
