import type { PayloadHandler, PayloadRequest } from 'payload'
import { APIError, ValidationError as PayloadValidationError } from 'payload'

import { submitDonation } from '@/services/donations/service'
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

export const donationsSubmitHandler: PayloadHandler = async (req: PayloadRequest) => {
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

  const {
    email,
    name,
    phone,
    addressText,
    amountUSD,
    lang,
    ref,
    checkoutName,
    entryUrl,
  } = (body ?? {}) as {
    email?: string
    name?: string | null
    phone?: string | null
    addressText?: string | null
    amountUSD?: string | number
    lang?: string
    ref?: string | null
    checkoutName?: string | null
    entryUrl?: string | null
  }

  if (!email || typeof amountUSD === 'undefined' || !lang) return badRequest()

  logInfo({ msg: 'Donations submit endpoint hit.' })

  const ctx = { payload: req.payload, logger: payloadLogger }

  try {
    const result = await submitDonation(ctx, {
      email,
      name,
      phone,
      addressText,
      amountUSD,
      lang,
      ref,
      checkoutName,
      entryUrl,
    })

    return okResponse({ url: result.url, publicOrderId: result.publicOrderId })
  } catch (error) {
    if (isBadRequestError(error)) return badRequest()

    logError({
      msg: 'Donations submit endpoint failed.',
      email,
      amountUSD,
      lang,
      ref,
      error: error instanceof Error ? error.message : String(error),
    })
    return serverError()
  }
}
