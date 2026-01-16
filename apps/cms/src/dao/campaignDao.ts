import { PrismaClient } from '@prisma'

/**
 * Campaigns are ref tag based. The Campaign DAO allows fetching entities by ref.
 */

const prisma = new PrismaClient()

export async function getPersonsByRef(ref: string) {
  return prisma.person.findMany({
    where: { ref }
  })
}

export async function getMembershipsByRef(ref: string) {
  return prisma.membership.findMany({
    where: { ref },
    include: {
      household: {
        include: {
          primaryContact: true,
        },
      },
    },
  })
}

export async function getSubscriptionsByRef(ref: string) {
  return prisma.subscription.findMany({
    where: { ref },
    include: {
      person: true,
    },
  })
}
