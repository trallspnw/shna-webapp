import { Gutter } from '@payloadcms/ui/elements/Gutter'
import { CollectionCards } from '@payloadcms/ui/rsc'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

const Dashboard = async ({ initPageResult }: AdminViewServerProps) => {
  const { req } = initPageResult
  const transactions = await req.payload.find({
    collection: 'transactions',
    sort: '-occurredAt',
    limit: 8,
    depth: 1,
  })

  const paidOrders = await req.payload.find({
    collection: 'orders',
    where: { status: { equals: 'paid' } },
    sort: '-updatedAt',
    limit: 8,
    depth: 1,
  })

  const orderIds = paidOrders.docs.map((order: any) => order.id)
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

  return (
    <Gutter left right className="dashboard__content">
      <CollectionCards req={req} widgetSlug="collections" />
      <div style={{ marginTop: 24 }}>
        <h3>Paid Orders (Pickup Queue)</h3>
        {paidOrders.docs.length === 0 ? (
          <p>No paid orders yet.</p>
        ) : (
          <ul>
            {paidOrders.docs.map((order: any) => {
              const eventTitle =
                typeof order.event === 'object' ? order.event?.title : order.event
              const items = itemsByOrder.get(String(order.id)) || []
              return (
                <li key={order.id}>
                  <strong>{order.orderNumber || order.id}</strong> —{' '}
                  {eventTitle ? `Event: ${eventTitle} — ` : ''}
                  Pricing: {order.pricingBasis || 'unknown'}
                  {items.length > 0 && (
                    <div>
                      Items:{' '}
                      {items
                        .map((item: any) => {
                          const name =
                            typeof item.product === 'object' ? item.product?.name : item.product
                          return `${item.quantity} × ${name}`
                        })
                        .join(', ')}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Latest Transactions</h3>
        {transactions.docs.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <ul>
            {transactions.docs.map((txn: any) => {
              const contactEmail =
                typeof txn.contact === 'object' ? txn.contact?.email : txn.contact
              const eventTitle = typeof txn.event === 'object' ? txn.event?.title : txn.event
              return (
                <li key={txn.id}>
                  {txn.kind} — ${txn.amountUSD} — {txn.status}
                  {contactEmail ? ` — ${contactEmail}` : ''} {eventTitle ? ` — ${eventTitle}` : ''}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Gutter>
  )
}

export default Dashboard
