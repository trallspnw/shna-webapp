'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

type ContactSummary = {
  name?: string | null
  email?: string | null
}

type OrderSummary = {
  id: string
  status?: string | null
  totalUSD?: number | null
  updatedAt?: string | null
  contact?: ContactSummary
  itemTypes: string[]
}

type MemberSummary = {
  id: string
  contact?: ContactSummary
  planName?: string | null
  endDay?: string | null
}

type Props = {
  initialOrders: OrderSummary[]
  initialMembers: MemberSummary[]
}

const formatUSD = (amount?: number | null) => {
  if (typeof amount !== 'number') return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

const mapOrderSummaries = (orders: any[], items: any[]): OrderSummary[] => {
  const itemsByOrder = new Map<string, string[]>()
  for (const item of items) {
    const orderId = typeof item.order === 'object' ? item.order?.id : item.order
    if (!orderId) continue
    const key = String(orderId)
    const bucket = itemsByOrder.get(key) || []
    if (item.itemType) bucket.push(String(item.itemType))
    itemsByOrder.set(key, bucket)
  }

  return orders.map((order) => {
    const contact = typeof order.contact === 'object' ? order.contact : null
    return {
      id: String(order.id),
      status: order.status ?? null,
      totalUSD: order.totalUSD ?? null,
      updatedAt: order.updatedAt ?? null,
      contact: {
        name: contact?.name ?? null,
        email: contact?.email ?? null,
      },
      itemTypes: Array.from(new Set(itemsByOrder.get(String(order.id)) || [])),
    }
  })
}

const mapMemberSummaries = (memberships: any[]): MemberSummary[] =>
  memberships.map((membership) => {
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

export const DashboardClient: React.FC<Props> = ({ initialOrders, initialMembers }) => {
  const [orders, setOrders] = useState<OrderSummary[]>(initialOrders)
  const [members, setMembers] = useState<MemberSummary[]>(initialMembers)
  const [liveRefresh, setLiveRefresh] = useState(false)

  const refreshData = useCallback(async () => {
    try {
      const ordersParams = new URLSearchParams({
        limit: '10',
        sort: '-updatedAt',
        depth: '1',
      })
      const ordersRes = await fetch(`/api/orders?${ordersParams.toString()}`, {
        credentials: 'include',
      })
      const ordersJson = await ordersRes.json()
      const ordersDocs = Array.isArray(ordersJson?.docs) ? ordersJson.docs : []
      const orderIds = ordersDocs.map((order: any) => order.id).filter(Boolean)

      let itemsDocs: any[] = []
      if (orderIds.length > 0) {
        const itemsParams = new URLSearchParams({
          depth: '0',
          limit: '200',
        })
        itemsParams.set('where[order][in]', orderIds.join(','))
        const itemsRes = await fetch(`/api/orderItems?${itemsParams.toString()}`, {
          credentials: 'include',
        })
        const itemsJson = await itemsRes.json()
        itemsDocs = Array.isArray(itemsJson?.docs) ? itemsJson.docs : []
      }

      const nowISO = new Date().toISOString()
      const membershipsParams = new URLSearchParams({
        depth: '1',
        limit: '2000',
        sort: 'endDay',
      })
      membershipsParams.set('where[startDay][less_than_equal]', nowISO)
      membershipsParams.set('where[endDay][greater_than_equal]', nowISO)
      const membershipsRes = await fetch(`/api/memberships?${membershipsParams.toString()}`, {
        credentials: 'include',
      })
      const membershipsJson = await membershipsRes.json()
      const membershipsDocs = Array.isArray(membershipsJson?.docs) ? membershipsJson.docs : []

      setOrders(mapOrderSummaries(ordersDocs, itemsDocs))
      setMembers(mapMemberSummaries(membershipsDocs))
    } catch (error) {
      console.error('[dashboard] refresh failed', error)
    }
  }, [])

  useEffect(() => {
    if (!liveRefresh) return
    const interval = setInterval(() => {
      void refreshData()
    }, 10000)
    return () => clearInterval(interval)
  }, [liveRefresh, refreshData])

  const hasOrders = orders.length > 0
  const hasMembers = members.length > 0

  const liveLabel = useMemo(
    () => (liveRefresh ? 'Live refresh on (10s)' : 'Live refresh off'),
    [liveRefresh],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Latest Orders</h3>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            checked={liveRefresh}
            onChange={(event) => setLiveRefresh(event.target.checked)}
            type="checkbox"
          />
          <span>{liveLabel}</span>
        </label>
      </div>
      {hasOrders ? (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <strong>
                {order.contact?.name || 'Unknown'} ({order.contact?.email || 'No email'})
              </strong>{' '}
              — {order.itemTypes.length > 0 ? order.itemTypes.join(', ') : 'Unknown item'} —{' '}
              {formatUSD(order.totalUSD)} — {order.status || 'unknown'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders yet.</p>
      )}

      <div>
        <h3>Active Members</h3>
        {hasMembers ? (
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                <strong>
                  {member.contact?.name || 'Unknown'} ({member.contact?.email || 'No email'})
                </strong>{' '}
                — {member.planName || 'Unknown plan'} — Expires {formatDate(member.endDay)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No active members yet.</p>
        )}
      </div>
    </div>
  )
}
