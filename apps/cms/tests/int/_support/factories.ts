import type { Payload, PayloadRequest } from 'payload'

type FactoryContext = {
  payload: Payload
  req: PayloadRequest
}

let sequence = 0

export const resetFactoryState = (): void => {
  sequence = 0
}

const nextLabel = (prefix: string): string => {
  sequence += 1
  return `${prefix}-${sequence}`
}

export const buildTopicData = (overrides: Partial<{ slug: string; name: string; description: string }> = {}) => {
  const label = nextLabel('topic')
  return {
    slug: `topic-${label}`,
    name: `Topic ${label}`,
    description: `Topic ${label} description`,
    ...overrides,
  }
}

export const buildCampaignData = (overrides: Partial<{ name: string; reftag: string }> = {}) => {
  const label = nextLabel('campaign')
  return {
    name: `Campaign ${label}`,
    reftag: `campaign-${label}`,
    ...overrides,
  }
}

export const buildContactData = (
  overrides: Partial<{
    email: string
    language: 'en' | 'es'
    campaign?: number | null
    lastEngagedAt?: string
  }> = {},
) => {
  const label = nextLabel('contact')
  return {
    email: `${label}@example.com`,
    language: 'en' as const,
    ...overrides,
  }
}

export const buildMembershipPlanData = (
  overrides: Partial<{
    key: string
    slug: string
    name: string
    price: number
    renewalWindowDays: number
    isActive?: boolean
  }> = {},
) => {
  const label = nextLabel('plan')
  return {
    key: `plan-${label}`,
    slug: `plan-${label}`,
    name: `Plan ${label}`,
    price: 10,
    renewalWindowDays: 30,
    isActive: true,
    ...overrides,
  }
}

export const createTopic = async (
  ctx: FactoryContext,
  overrides: Partial<{ slug: string; name: string; description: string }> = {},
) => {
  const data = buildTopicData(overrides)
  return ctx.payload.create({
    collection: 'subscriptionTopics',
    data,
    depth: 0,
    overrideAccess: true,
    req: ctx.req,
  })
}

export const createCampaign = async (
  ctx: FactoryContext,
  overrides: Partial<{ name: string; reftag: string }> = {},
) => {
  const data = buildCampaignData(overrides)
  return ctx.payload.create({
    collection: 'campaigns',
    data,
    depth: 0,
    overrideAccess: true,
    req: ctx.req,
  })
}

export const createContact = async (
  ctx: FactoryContext,
  overrides: Partial<{
    email: string
    language: 'en' | 'es'
    campaign?: number | null
    lastEngagedAt?: string
  }> = {},
) => {
  const data = buildContactData(overrides)
  return ctx.payload.create({
    collection: 'contacts',
    data,
    depth: 0,
    overrideAccess: true,
    req: ctx.req,
  })
}

export const createSubscription = async (
  ctx: FactoryContext,
  overrides: Partial<{ contact: number; topic: number; key: string; campaign?: number | null }> & {
    contact: number
    topic: number
  },
) => {
  const key = overrides.key ?? nextLabel('subscription')
  return ctx.payload.create({
    collection: 'subscriptions',
    data: {
      key,
      contact: overrides.contact,
      topic: overrides.topic,
      ...(typeof overrides.campaign === 'undefined' ? {} : { campaign: overrides.campaign }),
    },
    draft: false,
    depth: 0,
    overrideAccess: true,
    req: ctx.req,
  })
}

export const createMembershipPlan = async (
  ctx: FactoryContext,
  overrides: Partial<{
    key: string
    slug: string
    name: string
    price: number
    renewalWindowDays: number
    isActive?: boolean
  }> = {},
) => {
  const data = buildMembershipPlanData(overrides)
  return ctx.payload.create({
    collection: 'membershipPlans',
    data,
    depth: 0,
    overrideAccess: true,
    req: ctx.req,
  })
}
