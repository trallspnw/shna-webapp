import { Gutter } from '@payloadcms/ui/elements/Gutter'
import { CollectionCards } from '@payloadcms/ui/rsc'
import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { DashboardClient } from './DashboardClient'
import { ManualEntry } from './ManualEntry.client'

const Dashboard = async ({ initPageResult }: AdminViewServerProps) => {
  const { req } = initPageResult
  const latestOrders = await req.payload.find({
    collection: 'orders',
    sort: '-updatedAt',
    limit: 10,
    depth: 1,
  })

  const orderIds = latestOrders.docs.map((order: any) => order.id)
  const itemsByOrder = new Map<string, any[]>()

  if (orderIds.length > 0) {
    const items = await req.payload.find({
      collection: 'orderItems',
      where: { order: { in: orderIds } },
      limit: 200,
      depth: 1,
    })
    for (const item of items.docs) {
      const orderId = typeof item.order === 'object' ? item.order.id : item.order
      const orderKey = String(orderId)
      const bucket = itemsByOrder.get(orderKey) || []
      bucket.push(item)
      itemsByOrder.set(orderKey, bucket)
    }
  }

  const activeMembers = await req.payload.find({
    collection: 'memberships',
    where: {
      and: [
        { startDay: { less_than_equal: new Date().toISOString() } },
        { endDay: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    sort: 'endDay',
    limit: 2000,
    depth: 1,
  })

  const initialOrders = latestOrders.docs.map((order: any) => {
    const contact = typeof order.contact === 'object' ? order.contact : null
    const itemTypes = (itemsByOrder.get(String(order.id)) || [])
      .map((item: any) => item.itemType)
      .filter(Boolean)
    return {
      id: String(order.id),
      status: order.status ?? null,
      totalUSD: order.totalUSD ?? null,
      updatedAt: order.updatedAt ?? null,
      contact: {
        name: contact?.name ?? null,
        email: contact?.email ?? null,
      },
      itemTypes: Array.from(new Set(itemTypes)),
    }
  })

  const initialMembers = activeMembers.docs.map((membership: any) => {
    const contact = typeof membership.contact === 'object' ? membership.contact : null
    const plan = typeof membership.plan === 'object' ? membership.plan : null
    return {
      id: String(membership.id),
      contact: {
        name: contact?.name ?? null,
        email: contact?.email ?? null,
      },
      planName: plan?.name ?? null,
      endDay: membership.endDay ?? null,
    }
  })

  return (
    <Gutter left right className="dashboard__content">
      <DashboardClient initialOrders={initialOrders} initialMembers={initialMembers} />
      <div style={{ marginTop: 24 }}>
        <ManualEntry />
      </div>
      <div style={{ marginTop: 24 }}>
        <CollectionCards req={req} widgetSlug="collections" />
      </div>
    </Gutter>
  )
}

export default Dashboard
