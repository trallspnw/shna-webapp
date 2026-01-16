import { PrismaClient } from '@prisma'

const prisma = new PrismaClient()

/**
 * Get a person by id.
 * @param id The id of the person to get
 * @returns Returns the person record
 */
export async function getPersonById(id: string) {
  return await prisma.person.findUnique({
    where: { id }
  })
}

/**
 * Search persons by name or email. Supports semi-fuzzy matching via prisma insesitive mode.
 * @param query A query string containing a name or email to match
 * @returns Person records matching the query
 */
export async function searchPersons(query: string) {
  return await prisma.person.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
  })
}

/**
 * Creates a new person record. Fails if use with the provided email already exists.
 * @param email The email address of the person
 * @param name The name of the person
 * @param phone The phone number of the person
 * @param address The address of the person
 * @param language Ther preferred language of the person
 * @param ref The ref tag to associate with the person
 * @returns The created person record
 */
export async function createPerson(
  email: string,
  name?: string,
  phone?: string,
  address?: string,
  language?: string,
  ref?: string,
) {
  return await prisma.$transaction(async (client) => {
    const existing = await client.person.findUnique({
      where: { email },
    })

    if (existing) {
      return {
        success: false,
        reason: 'EMAIL_ALREADY_EXISTS',
      }
    }

    const person = await client.person.create({
      data: {
        email,
        name,
        phone,
        address,
        language,
        ref,
      },
    })

    return {
      success: true,
      person,
    }
  })
}

/**
 * Updates a person record.
 * @param id The ID of ther person to update
 * @param email The new email address for the person, must be unique
 * @param name The new name for the person
 * @param phone The new address for the person
 * @param address The new address for the person
 * @param language The new language of preference for the person
 * @param ref The ref tag to associate with the person
 * @returns 
 */
export async function updatePerson(
  id: string,
  email: string,
  name?: string,
  phone?: string,
  address?: string,
  language?: string,
  ref?: string,
) {
  return await prisma.$transaction(async (client) => {
    const person = await client.person.findUnique({ 
      where: { id },
    })

    if (!person) {
      return {
        success: false,
        reason: 'NOT_FOUND',
      }
    }

    if (email !== person.email) {
      const existing = await client.person.findUnique({
        where: { email },
      })

      if (existing) {
        return {
          success: false,
          reason: 'EMAIL_ALREADY_EXISTS',
        }
      }
    }

    const updated = await client.person.update({
      where: { id },
      data: {
        email,
        name,
        phone,
        address,
        language,
        ref,
      },
    })

    return {
      success: true,
      person: updated,
    }
  })
}

/**
 * Deletes all records for a specified person ID. Deletes from persons, memberships, and subscriptions.
 * @param id The id of the person to delete
 * @returns Success or failure
 */
export async function deletePerson(id: string) {
  return await prisma.$transaction(async (client) => {
    const person = await client.person.findUnique({ 
      where: { id } 
    })

    if (!person) {
      return {
        success: false,
        reason: 'NOT_FOUND',
      }
    }

    // Remove household membership links and dependent households
    const households = await client.household.findMany({
      where: { primaryContactId: id },
    })

    for (const household of households) {
      await client.membership.deleteMany({ where: { householdId: household.id } })
      await client.household_member.deleteMany({ where: { householdId: household.id } })
      await client.household.delete({ where: { id: household.id } })
    }

    await client.household_member.deleteMany({
      where: { personId: id },
    })

    await client.subscription.deleteMany({
      where: { personId: id },
    })

    await client.person.delete({
      where: { id },
    })

    return {
      success: true,
    }
  })
}
