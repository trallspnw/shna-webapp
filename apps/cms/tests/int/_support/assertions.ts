import type { Payload } from 'payload'

type ContactDoc = { id: string | number; email?: string | null; campaign?: string | number | null; lastEngagedAt?: string | null; language?: string | null }

type SubscriptionDoc = { id: string | number; contact?: string | number | null; topic?: string | number | null; campaign?: string | number | null }

type TopicDoc = { id: string | number; slug?: string | null }

type CampaignDoc = { id: string | number; reftag?: string | null }

export const findContactByEmail = async (payload: Payload, email: string): Promise<ContactDoc | null> => {
  const result = await payload.find({
    collection: 'contacts',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (result?.docs?.[0] as ContactDoc | undefined) ?? null
}

export const findSubscriptionsByContact = async (
  payload: Payload,
  contactId: string | number,
): Promise<SubscriptionDoc[]> => {
  const result = await payload.find({
    collection: 'subscriptions',
    where: { contact: { equals: contactId } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  return (result?.docs ?? []) as SubscriptionDoc[]
}

export const findTopicBySlug = async (payload: Payload, slug: string): Promise<TopicDoc | null> => {
  const result = await payload.find({
    collection: 'subscriptionTopics',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (result?.docs?.[0] as TopicDoc | undefined) ?? null
}

export const findCampaignByReftag = async (payload: Payload, reftag: string): Promise<CampaignDoc | null> => {
  const result = await payload.find({
    collection: 'campaigns',
    where: { reftag: { equals: reftag } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (result?.docs?.[0] as CampaignDoc | undefined) ?? null
}
