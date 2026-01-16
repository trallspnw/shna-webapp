import { HouseholdMemberRole, MembershipType, PrismaClient } from '@prisma'

const prisma = new PrismaClient()

export type HouseholdMemberInput = {
  name?: string
  email?: string
  phone?: string
  address?: string
  language?: string
}

type InitMembershipParams = {
  membershipType: MembershipType
  primaryContact: {
    email: string
    name: string
    phone?: string
    address?: string
    language?: string
    ref?: string
  }
  householdName?: string
  members?: HouseholdMemberInput[]
  maxHouseholdSize?: number
}

/**
 * Initializes a membership. Ensures the household does not have an active membership and builds/updates household
 * membership state (primary contact + optional additional members).
 */
export async function initMembership(params: InitMembershipParams) {
  const { membershipType, primaryContact, householdName, members = [], maxHouseholdSize } = params

  const totalMembers = 1 + members.length
  if (membershipType === 'FAMILY' && maxHouseholdSize && totalMembers > maxHouseholdSize) {
    return {
      success: false,
      reason: 'MAX_HOUSEHOLD_SIZE',
    }
  }

  return await prisma.$transaction(async (client) => {
    const primaryPerson = await upsertPerson(client, primaryContact.email, {
      name: primaryContact.name,
      phone: primaryContact.phone,
      address: primaryContact.address,
      language: primaryContact.language,
      ref: primaryContact.ref,
    })

    let household = await client.household.findFirst({
      where: { primaryContactId: primaryPerson.id },
      include: {
        memberships: {
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
      },
    })

    // Validate no active membership (more than 1 month remaining)
    const now = new Date()
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(now.getMonth() + 1)
    const mostRecentMembership = household?.memberships[0]
    if (mostRecentMembership?.expiresAt && mostRecentMembership.expiresAt > oneMonthFromNow) {
      return {
        success: false,
        reason: 'ACTIVE_MEMBERSHIP',
      }
    }

    if (!household) {
      household = await client.household.create({
        data: {
          type: membershipType,
          name: householdName,
          ref: primaryContact.ref,
          primaryContactId: primaryPerson.id,
        },
      })
    } else {
      household = await client.household.update({
        where: { id: household.id },
        data: {
          type: membershipType,
          name: householdName,
          ref: primaryContact.ref ?? household.ref,
        },
      })
    }

    // Rebuild household members
    await client.household_member.deleteMany({
      where: { householdId: household.id },
    })

    await client.household_member.create({
      data: {
        householdId: household.id,
        personId: primaryPerson.id,
        role: HouseholdMemberRole.PRIMARY,
      },
    })

    for (const member of members) {
      const person = await upsertPerson(client, member.email, {
        name: member.name,
        phone: member.phone,
        address: member.address,
        language: member.language,
      })

      await client.household_member.create({
        data: {
          householdId: household.id,
          personId: person.id,
          role: HouseholdMemberRole.MEMBER,
        },
      })
    }

    return {
      success: true,
      householdId: household.id,
    }
  })
}

/**
 * Finalizes a membership. Called after payment confirmation. Creates a new membership record.
 * @param householdId The ID of the household to create a membership for
 * @param ref The ref tag associated with the membership
 */
export async function completeMembership(householdId: string, ref?: string) {
  return await prisma.$transaction(async (client) => {
    const household = await client.household.findUnique({
      where: { id: householdId },
      include: {
        memberships: {
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!household) {
      console.error('Tried to complete membership for a non-existing household', householdId)
      throw new Error('Household not found')
    }

    const now = new Date()
    const mostRecentMembership = household.memberships[0]
    const createdAt = mostRecentMembership?.expiresAt && mostRecentMembership.expiresAt > now
      ? new Date(mostRecentMembership.expiresAt)
      : now

    const expiresAt = new Date(createdAt)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const membership = await client.membership.create({
      data: {
        householdId,
        createdAt,
        expiresAt,
        ref: ref?.trim() || undefined,
      }
    })

    console.log(`Added new membership! Household: ${membership.householdId}`)
  })
}

/**
 * Gets the newest membership associated with a specified email address
 * @param email The email address to pull membership information for
 * @returns The latest membership record or null if no membership records
 */
export async function getLatestMembershipByEmail(email: string) {
  const person = await prisma.person.findUnique({
    where: { email },
    include: {
      householdMembers: {
        include: {
          household: {
            include: {
              memberships: {
                orderBy: { expiresAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  const households = person?.householdMembers?.map((hm) => hm.household) || []
  const membership = households.flatMap((h) => h.memberships).sort((a, b) => {
    return (b.expiresAt?.getTime() ?? 0) - (a.expiresAt?.getTime() ?? 0)
  })[0]

  return membership ?? null
}

/**
 * Search members by email or name. Supports semi-fuzzy matching via prisma insensitive mode.
 * @param query A query string containing a name or email to match
 * @returns Household and membership info for members matching the query
 */
export async function searchMembers(query: string) {
  const now = new Date()

  const households = await prisma.household.findMany({
    where: {
      members: {
        some: {
          person: {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      },
    },
    include: {
      memberships: {
        orderBy: { createdAt: 'asc' },
      },
      members: {
        include: {
          person: true,
        },
      },
      primaryContact: true,
    },
  })

  return households.map((household) => {
    const memberships = household.memberships
    const startDate = memberships.at(0)?.createdAt
    const expiresAt = memberships.at(-1)?.expiresAt
    const active = expiresAt ? expiresAt > now : false
    const latestRef = memberships.at(-1)?.ref
    const primary = household.primaryContact

    return {
      id: household.id,
      type: household.type,
      name: household.name,
      primaryEmail: primary?.email,
      primaryName: primary?.name,
      phone: primary?.phone,
      address: primary?.address,
      startDate,
      expiresAt,
      active,
      ref: latestRef,
      members: household.members.map((member) => ({
        id: member.person.id,
        name: member.person.name,
        email: member.person.email,
        phone: member.person.phone,
        role: member.role,
      })),
    }
  }).sort((a, b) => {
    return (b.expiresAt?.getTime() ?? 0) - (a.expiresAt?.getTime() ?? 0)
  })
}

export async function getHouseholdById(id: string) {
  return prisma.household.findUnique({
    where: { id },
    include: {
      primaryContact: true,
      members: {
        include: {
          person: true,
        },
      },
    },
  })
}

async function upsertPerson(
  client: PrismaClient,
  email?: string | null,
  data?: {
    name?: string
    phone?: string
    address?: string
    language?: string
    ref?: string
  },
) {
  if (email) {
    const existing = await client.person.findUnique({
      where: { email },
    })

    if (existing) {
      return await client.person.update({
        where: { email },
        data: {
          ...(data?.name !== undefined ? { name: data.name } : {}),
          ...(data?.phone !== undefined ? { phone: data.phone } : {}),
          ...(data?.address !== undefined ? { address: data.address } : {}),
          ...(data?.language !== undefined ? { language: data.language } : {}),
          ...(data?.ref !== undefined ? { ref: data.ref } : {}),
        },
      })
    }
  }

  return await client.person.create({
    data: {
      email: email ?? null,
      name: data?.name,
      phone: data?.phone,
      address: data?.address,
      language: data?.language,
      ref: data?.ref,
    },
  })
}
