import type { Payload, PayloadRequest } from 'payload'
import { createLocalReq } from 'payload'

import { subscriptionsHandler } from '@/endpoints/subscriptions'
import { donationsSubmitHandler } from '@/endpoints/donations'
import { membershipsSubmitHandler } from '@/endpoints/memberships'
import { ordersStatusHandler } from '@/endpoints/orders'

export const postSubscriptions = async (
  payload: Payload,
  body: unknown,
): Promise<Response> => {
  const baseReq = (await createLocalReq({}, payload)) as PayloadRequest

  const req = {
    ...baseReq,
    url: '/api/public/subscriptions/submit',
    payload,
    json: async () => body,
  }

  return subscriptionsHandler(req as PayloadRequest)
}

export const postDonations = async (payload: Payload, body: unknown): Promise<Response> => {
  const baseReq = (await createLocalReq({}, payload)) as PayloadRequest

  const req = {
    ...baseReq,
    url: '/api/public/donations/submit',
    payload,
    json: async () => body,
  }

  return donationsSubmitHandler(req as PayloadRequest)
}

export const postMemberships = async (payload: Payload, body: unknown): Promise<Response> => {
  const baseReq = (await createLocalReq({}, payload)) as PayloadRequest

  const req = {
    ...baseReq,
    url: '/api/public/memberships/submit',
    payload,
    json: async () => body,
  }

  return membershipsSubmitHandler(req as PayloadRequest)
}

export const getOrderStatus = async (
  payload: Payload,
  publicOrderId: string,
): Promise<Response> => {
  const baseReq = (await createLocalReq({}, payload)) as PayloadRequest
  const req = {
    ...baseReq,
    url: `/api/public/orders/status?publicOrderId=${encodeURIComponent(publicOrderId)}`,
    payload,
  }

  return ordersStatusHandler(req as PayloadRequest)
}
