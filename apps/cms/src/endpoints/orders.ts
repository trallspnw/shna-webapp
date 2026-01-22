import type { PayloadHandler, PayloadRequest } from 'payload'
import { APIError, ValidationError as PayloadValidationError } from 'payload'

import { getOrderStatus } from '@/services/donations/service'
import { ValidationError as ServiceValidationError } from '@/services/donations/types'

const okResponse = (data: Record<string, unknown>) => Response.json({ ok: true, data })
const badRequest = () =>
  new Response(JSON.stringify({ ok: false, error: 'bad_request' }), { status: 400 })
const serverError = () =>
  new Response(JSON.stringify({ ok: false, error: 'server_error' }), { status: 500 })

const isBadRequestError = (error: unknown): boolean => {
  if (error instanceof ServiceValidationError) return true
  if (error instanceof PayloadValidationError) return true
  if (error instanceof APIError && error.status === 400) return true
  return false
}

const getPublicOrderId = (req: PayloadRequest): string | null => {
  if (!req.url) return null
  try {
    const url = new URL(req.url, 'http://localhost')
    const value = url.searchParams.get('publicOrderId')
    return value
  } catch {
    return null
  }
}

export const ordersStatusHandler: PayloadHandler = async (req: PayloadRequest) => {
  const publicOrderId = getPublicOrderId(req)
  if (!publicOrderId) return badRequest()

  const payloadLogger = req.payload?.logger ?? console
  const logError = 'error' in payloadLogger ? payloadLogger.error.bind(payloadLogger) : console.error
  const logInfo = 'info' in payloadLogger ? payloadLogger.info.bind(payloadLogger) : console.info

  logInfo({ msg: 'Orders status endpoint hit.' })

  const ctx = { payload: req.payload, logger: payloadLogger }

  try {
    const result = await getOrderStatus(ctx, { publicOrderId })
    return okResponse({
      status: result.status,
      terminal: result.terminal,
      totalUSD: result.totalUSD,
    })
  } catch (error) {
    if (isBadRequestError(error)) return badRequest()

    logError({
      msg: 'Orders status endpoint failed.',
      publicOrderId,
      error: error instanceof Error ? error.message : String(error),
    })
    return serverError()
  }
}
