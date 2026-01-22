import { normalizeEmail } from '@/lib/email/normalizeEmail'
import { resolveCampaignIdFromRef } from '@/services/campaigns/resolveCampaign'

import type {
  ServiceCtx,
  SubscribeInput,
  SubscribeResult,
  UnsubscribeAllInput,
  UnsubscribeAllResult,
  UpdateInput,
  UpdateResult,
} from './types'
import { ValidationError } from './types'

type SubscriptionTopicDoc = {
  id: number
  slug?: string | null
}

type SubscriptionDoc = {
  id: number | string
  topic?: number | null
}

type ContactDoc = {
  id: number
}

const resolveTopicsBySlug = async (payload: ServiceCtx['payload'], slugs: string[]) => {
  const uniqueSlugs = Array.from(new Set(slugs.map((s) => s.trim().toLowerCase()).filter(Boolean)))

  if (uniqueSlugs.length === 0) {
    throw new ValidationError('At least one topic is required.', { field: 'topics' })
  }

  const result = await payload.find({
    collection: 'subscriptionTopics',
    where: {
      slug: {
        in: uniqueSlugs,
      },
    },
    limit: uniqueSlugs.length,
    depth: 0,
  })

  const docs = (result?.docs ?? []) as SubscriptionTopicDoc[]
  const found = new Map<string, SubscriptionTopicDoc>()
  for (const doc of docs) {
    if (doc.slug) found.set(doc.slug, doc)
  }

  const missing = uniqueSlugs.filter((slug) => !found.has(slug))
  if (missing.length > 0) {
    throw new ValidationError('Requested topic does not exist.', {
      field: 'topics',
      missing,
    })
  }

  return uniqueSlugs.map((slug) => found.get(slug)!)
}

const findContactByEmail = async (
  payload: ServiceCtx['payload'],
  email: string,
): Promise<ContactDoc | null> => {
  const result = await payload.find({
    collection: 'contacts',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })

  return (result?.docs?.[0] as ContactDoc | undefined) ?? null
}

export const subscribe = async (
  ctx: ServiceCtx,
  input: SubscribeInput,
): Promise<SubscribeResult> => {
  const normalizedEmail = normalizeEmail(input.email)
  if (!normalizedEmail) {
    throw new ValidationError('Email is required.', { field: 'email' })
  }

  const now = new Date().toISOString()

  // If you want to hard-restrict, validate lang; otherwise just pass through.
  const language = (input.lang ?? undefined) as 'en' | 'es' | undefined

  const topics = await resolveTopicsBySlug(ctx.payload, input.topics)
  if (topics.length === 0 || topics.some((topic) => typeof topic.id === 'undefined' || topic.id === null)) {
    throw new ValidationError('Requested topic does not exist.', { field: 'topics' })
  }

  const campaignId = await resolveCampaignIdFromRef(ctx.payload, input.ref, ctx.logger)

  const existingContact = await findContactByEmail(ctx.payload, normalizedEmail)

  const contact = (
    existingContact
      ? await ctx.payload.update({
          collection: 'contacts',
          id: existingContact.id,
          data: {
            lastEngagedAt: now,
            ...(language ? { language } : {}),
          },
        })
      : await ctx.payload.create({
          collection: 'contacts',
          data: {
            email: normalizedEmail,
            ...(language ? { language } : {}),
            ...(campaignId ? { campaign: campaignId } : {}),
            lastEngagedAt: now,
          },
        } as Parameters<typeof ctx.payload.create>[0])
  ) as ContactDoc
  if (!contact?.id) {
    throw new ValidationError('Contact could not be created.', { field: 'email' })
  }

  const contactId = contact.id as number
  const topicIds = topics.map((t) => t.id)

  const existingSubscriptions = await ctx.payload.find({
    collection: 'subscriptions',
    where: {
      and: [{ contact: { equals: contactId } }, { topic: { in: topicIds } }],
    },
    limit: topicIds.length,
    depth: 0,
  })

  const existingByTopic = new Map<string, SubscriptionDoc>()
  for (const doc of (existingSubscriptions?.docs ?? []) as SubscriptionDoc[]) {
    if (doc.topic !== null && typeof doc.topic !== 'undefined') {
      existingByTopic.set(String(doc.topic), doc)
    }
  }

  const subscriptionIds: string[] = []
  for (const topic of topics) {
    const existing = existingByTopic.get(String(topic.id))
    if (existing) {
      subscriptionIds.push(String(existing.id))
      continue
    }

    const created = await ctx.payload.create({
      collection: 'subscriptions',
      data: {
        contact: contactId, // number
        topic: topic.id, // number
        ...(campaignId ? { campaign: campaignId } : {}),
      },
    } as Parameters<typeof ctx.payload.create>[0])

    subscriptionIds.push(String(created.id))
  }

  return {
    ok: true,
    contactId: String(contactId),
    subscriptionIds,
  }
}

export const unsubscribeAll = async (
  ctx: ServiceCtx,
  input: UnsubscribeAllInput,
): Promise<UnsubscribeAllResult> => {
  const normalizedEmail = normalizeEmail(input.email)
  if (!normalizedEmail) {
    throw new ValidationError('Email is required.', { field: 'email' })
  }

  const contact = await findContactByEmail(ctx.payload, normalizedEmail)
  if (!contact) {
    return { ok: true, contactId: null, deleted: 0 }
  }

  const contactId = contact.id
  const now = new Date().toISOString()

  await ctx.payload.update({
    collection: 'contacts',
    id: contactId,
    data: { lastEngagedAt: now },
  })

  // Delete-by-id loop; keep querying page 1 until empty to avoid paging/skip issues while deleting.
  let deleted = 0
  const limit = 100

  while (true) {
    const batch = await ctx.payload.find({
      collection: 'subscriptions',
      where: { contact: { equals: contactId } },
      limit,
      page: 1,
      depth: 0,
    })

    const docs = (batch?.docs ?? []) as SubscriptionDoc[]
    if (docs.length === 0) break

    for (const doc of docs) {
      await ctx.payload.delete({
        collection: 'subscriptions',
        id: doc.id,
      })
      deleted += 1
    }

    if (docs.length < limit) break
  }

  return {
    ok: true,
    contactId: String(contactId),
    deleted,
  }
}

export const update = async (_ctx: ServiceCtx, _input: UpdateInput): Promise<UpdateResult> => {
  return { ok: false, reason: 'not_implemented' }
}
