import { JSX } from 'react'
import { General, MembershipDuesForm as MembershipDuesFormType } from '@common/types/payload-types'
import { MembershipDuesForm } from '../../components/MembershipDuesForm'

/**
 * Handles rendering of membership dues form blocks.
 */
export function render(
  block: MembershipDuesFormType,
  index: number,
  fetchers: any,
  generalGlobals: General,
): JSX.Element {

  return (
    <MembershipDuesForm
      key={index}
      backendUrl={process.env.BASE_URL || ''}
      membershipPrices={generalGlobals.membershipPrices || {}}
      membershipTypeLabel={block.membershipTypeLabel}
      membershipTypeIndividualLabel={block.membershipTypeIndividualLabel}
      membershipTypeFamilyLabel={block.membershipTypeFamilyLabel}
      householdNameLabel={block.householdNameLabel}
      householdNamePlaceholder={block.householdNamePlaceholder}
      membersLabel={block.membersLabel}
      addMemberLabel={block.addMemberLabel}
      removeMemberLabel={block.removeMemberLabel}
      primaryMemberLabel={generalGlobals.memberLabels?.primaryMemberLabel}
      additionalMemberLabel={generalGlobals.memberLabels?.additionalMemberLabel}
      detailsHeading={generalGlobals.membershipForm?.detailsHeading}
      memberOptionalHelp={generalGlobals.membershipForm?.memberOptionalHelp}
      emailLabel={generalGlobals.email?.emailLabel}
      emailPlaceholder={generalGlobals.email?.emailPlaceholder}
      emailValidationError={generalGlobals.email?.emailValidationError}
      nameLabel={generalGlobals.name?.nameLabel}
      namePlaceholder={generalGlobals.name?.namePlaceholder}
      nameValidationError={generalGlobals.name?.nameValidationError}
      phoneLabel={generalGlobals.phone?.phoneLabel}
      phonePlaceholder={generalGlobals.phone?.phonePlaceholder}
      phoneValidationError={generalGlobals.phone?.phoneValidationError}
      addressLabel={generalGlobals.address?.addressLabel}
      addressPlaceholder={generalGlobals.address?.addressPlaceholder}
      addressValidationError={generalGlobals.address?.addressValidationError}
      submitButtonText={block.submitButtonText}
      priceLabel={block.priceLabel}
      maxHouseholdSize={generalGlobals.maxHouseholdSize}
      itemName={block.itemName}
      existingMembershipMessage={block.existingMembershipMessage}
      serverFailureMessage={block.serverFailureMessage}
    />
  )
}
