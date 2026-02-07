import type { PayloadHandler, PayloadRequest } from 'payload'
import { APIError, ValidationError as PayloadValidationError } from 'payload'

import { submitMembershipManual } from '@/services/memberships/service'
import { ValidationError as ServiceValidationError } from '@/services/memberships/types'

const okResponse = (data: Record<string, unknown>) => Response.json({ ok: true, data })
const badRequest = (error = 'bad_request') =>
  new Response(JSON.stringify({ ok: false, error }), { status: 400 })
const unauthorized = () =>
  new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401 })
const methodNotAllowed = () =>
  new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), { status: 405 })
const serverError = () =>
  new Response(JSON.stringify({ ok: false, error: 'server_error' }), { status: 500 })

const isBadRequestError = (error: unknown): boolean => {
  if (error instanceof ServiceValidationError) return true
  if (error instanceof PayloadValidationError) return true
  if (error instanceof APIError && error.status === 400) return true
  return false
}

export const adminMembershipsSubmitHandler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.method && req.method.toUpperCase() !== 'POST') return methodNotAllowed()
  if (!req.user) return unauthorized()
  if (!req.json) return badRequest()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest()
  }

  const payloadLogger = req.payload?.logger ?? console
  const logError = 'error' in payloadLogger ? payloadLogger.error.bind(payloadLogger) : console.error
  const logInfo = 'info' in payloadLogger ? payloadLogger.info.bind(payloadLogger) : console.info

  const { email, planSlug, paymentMethod, name, locale } = (body ?? {}) as {
    email?: string
    planSlug?: string
    paymentMethod?: 'cash' | 'check'
    name?: string
    locale?: 'en' | 'es'
  }

  logInfo({ msg: 'Admin memberships submit endpoint hit.' })

  const ctx = { payload: req.payload, logger: payloadLogger }

  try {
    const result = await submitMembershipManual(ctx, {
      email: email ?? '',
      planSlug: planSlug ?? '',
      paymentMethod: paymentMethod as 'cash' | 'check',
      name: name ?? '',
      locale,
    })

    return okResponse({
      publicOrderId: result.publicOrderId,
      orderId: result.orderId,
      membershipId: result.membershipId,
    })
  } catch (error) {
    if (isBadRequestError(error)) return badRequest()

    logError({
      msg: 'Admin memberships submit endpoint failed.',
      email,
      planSlug,
      paymentMethod,
      error: error instanceof Error ? error.message : String(error),
    })
    return serverError()
  }
}
