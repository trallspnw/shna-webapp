import type { Payload, PayloadRequest } from 'payload'

type ResetOptions = {
  emails: string[]
  topicSlugs?: string[]
  campaignReftags?: string[]
  orderPublicIds?: string[]
}

type ResetMembershipOptions = {
  emails: string[]
  planSlugs?: string[]
  campaignReftags?: string[]
  orderPublicIds?: string[]
}

export const resetSubscriptionsTestState = async (
  payload: Payload,
  req: PayloadRequest,
  options: ResetOptions,
): Promise<void> => {
  const { emails, topicSlugs = [], campaignReftags = [] } = options

  if (emails.length > 0) {
    const contacts = await payload.find({
      collection: 'contacts',
      where: { email: { in: emails } },
      limit: emails.length,
      depth: 0,
      overrideAccess: true,
    })

    const contactIds = (contacts.docs ?? [])
      .map((doc) => (doc as { id?: string | number }).id)
      .filter((id): id is string | number => Boolean(id))

    if (contactIds.length > 0) {
      await payload.delete({
        collection: 'subscriptions',
        where: { contact: { in: contactIds } },
        overrideAccess: true,
        req,
      })
    }

    // Use direct DB delete to avoid preferences cleanup in drifted schemas.
    await payload.db.deleteMany({
      collection: 'contacts',
      where: { email: { in: emails } },
      req,
    })
  }

  if (topicSlugs.length > 0) {
    await payload.delete({
      collection: 'subscriptionTopics',
      where: { slug: { in: topicSlugs } },
      overrideAccess: true,
      req,
    })
  }

  if (campaignReftags.length > 0) {
    await payload.delete({
      collection: 'campaigns',
      where: { reftag: { in: campaignReftags } },
      overrideAccess: true,
      req,
    })
  }
}

export const resetDonationsTestState = async (
  payload: Payload,
  req: PayloadRequest,
  options: ResetOptions,
): Promise<void> => {
  const { emails, campaignReftags = [], orderPublicIds = [] } = options

  if (orderPublicIds.length > 0) {
    const orders = await payload.find({
      collection: 'orders',
      where: { publicId: { in: orderPublicIds } },
      limit: orderPublicIds.length,
      depth: 0,
      overrideAccess: true,
    })

    const orderIds = (orders.docs ?? [])
      .map((doc) => (doc as { id?: string | number }).id)
      .filter((id): id is string | number => Boolean(id))

    if (orderIds.length > 0) {
      await payload.delete({
        collection: 'orderItems',
        where: { order: { in: orderIds } },
        overrideAccess: true,
        req,
      })
      await payload.delete({
        collection: 'transactions',
        where: { order: { in: orderIds } },
        overrideAccess: true,
        req,
      })
      await payload.delete({
        collection: 'orders',
        where: { id: { in: orderIds } },
        overrideAccess: true,
        req,
      })
    }
  }

  if (emails.length > 0) {
    const contacts = await payload.find({
      collection: 'contacts',
      where: { email: { in: emails } },
      limit: emails.length,
      depth: 0,
      overrideAccess: true,
    })

    const contactIds = (contacts.docs ?? [])
      .map((doc) => (doc as { id?: string | number }).id)
      .filter((id): id is string | number => Boolean(id))

    if (contactIds.length > 0) {
      const orders = await payload.find({
        collection: 'orders',
        where: { contact: { in: contactIds } },
        limit: 100,
        depth: 0,
        overrideAccess: true,
      })

      const orderIds = (orders.docs ?? [])
        .map((doc) => (doc as { id?: string | number }).id)
        .filter((id): id is string | number => Boolean(id))

      if (orderIds.length > 0) {
        await payload.delete({
          collection: 'orderItems',
          where: { order: { in: orderIds } },
          overrideAccess: true,
          req,
        })
        await payload.delete({
          collection: 'transactions',
          where: { order: { in: orderIds } },
          overrideAccess: true,
          req,
        })
        await payload.delete({
          collection: 'orders',
          where: { id: { in: orderIds } },
          overrideAccess: true,
          req,
        })
      }
    }

    await payload.delete({
      collection: 'contacts',
      where: { email: { in: emails } },
      overrideAccess: true,
      req,
    })
  }

  if (campaignReftags.length > 0) {
    await payload.delete({
      collection: 'campaigns',
      where: { reftag: { in: campaignReftags } },
      overrideAccess: true,
      req,
    })
  }
}

export const resetMembershipsTestState = async (
  payload: Payload,
  req: PayloadRequest,
  options: ResetMembershipOptions,
): Promise<void> => {
  const { emails, planSlugs = [], campaignReftags = [], orderPublicIds = [] } = options

  if (emails.length > 0) {
    await payload.delete({
      collection: 'emailSends',
      where: { toEmail: { in: emails } },
      overrideAccess: true,
      req,
    })
  }

  if (orderPublicIds.length > 0) {
    const orders = await payload.find({
      collection: 'orders',
      where: { publicId: { in: orderPublicIds } },
      limit: orderPublicIds.length,
      depth: 0,
      overrideAccess: true,
    })

    const orderIds = (orders.docs ?? [])
      .map((doc) => (doc as { id?: string | number }).id)
      .filter((id): id is string | number => Boolean(id))

    if (orderIds.length > 0) {
      await payload.delete({
        collection: 'orderItems',
        where: { order: { in: orderIds } },
        overrideAccess: true,
        req,
      })
      await payload.delete({
        collection: 'transactions',
        where: { order: { in: orderIds } },
        overrideAccess: true,
        req,
      })
      await payload.delete({
        collection: 'orders',
        where: { id: { in: orderIds } },
        overrideAccess: true,
        req,
      })
    }
  }

  if (emails.length > 0) {
    const contacts = await payload.find({
      collection: 'contacts',
      where: { email: { in: emails } },
      limit: emails.length,
      depth: 0,
      overrideAccess: true,
    })

    const contactIds = (contacts.docs ?? [])
      .map((doc) => (doc as { id?: string | number }).id)
      .filter((id): id is string | number => Boolean(id))

    if (contactIds.length > 0) {
      await payload.db.deleteMany({
        collection: 'memberships',
        where: { contact: { in: contactIds } },
        req,
      })

      const orders = await payload.find({
        collection: 'orders',
        where: { contact: { in: contactIds } },
        limit: 100,
        depth: 0,
        overrideAccess: true,
      })

      const orderIds = (orders.docs ?? [])
        .map((doc) => (doc as { id?: string | number }).id)
        .filter((id): id is string | number => Boolean(id))

      if (orderIds.length > 0) {
        await payload.db.deleteMany({
          collection: 'orderItems',
          where: { order: { in: orderIds } },
          req,
        })
        await payload.db.deleteMany({
          collection: 'transactions',
          where: { order: { in: orderIds } },
          req,
        })
        await payload.db.deleteMany({
          collection: 'orders',
          where: { id: { in: orderIds } },
          req,
        })
      }
    }

    await payload.db.deleteMany({
      collection: 'contacts',
      where: { email: { in: emails } },
      req,
    })
  }

  if (planSlugs.length > 0) {
    await payload.db.deleteMany({
      collection: 'membershipPlans',
      where: { slug: { in: planSlugs } },
      req,
    })
  }

  if (campaignReftags.length > 0) {
    await payload.db.deleteMany({
      collection: 'campaigns',
      where: { reftag: { in: campaignReftags } },
      req,
    })
  }
}
