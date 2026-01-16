import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { General } from '@/packages/common/src/types/payload-types'

/**
 * Helper for getting the current membership prices and limits from payload.
 * @returns The current membership prices and max household size
 */
export async function getMembershipSettings() {
    const payload = await getPayload({ config: configPromise })
    const generalGlobals = await payload.findGlobal({ slug: 'general' }) as General 
    return {
      membershipPrices: generalGlobals.membershipPrices,
      maxHouseholdSize: generalGlobals.maxHouseholdSize,
    }
}
