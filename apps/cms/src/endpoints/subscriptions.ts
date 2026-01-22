import type { PayloadHandler, PayloadRequest } from 'payload'
import { APIError, ValidationError as PayloadValidationError } from 'payload'

import { subscribe, unsubscribeAll } from '@/services/subscriptions/service'
import { ValidationError as ServiceValidationError } from '@/services/subscriptions/types'

const okResponse = () => Response.json({ ok: true })
const badRequest = () => new Response(JSON.stringify({ ok: false, error: 'bad_request' }), { status: 400 })
const serverError = () =>
  new Response(JSON.stringify({ ok: false, error: 'server_error' }), { status: 500 })

const isNonEmptyStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string')

const isBadRequestError = (error: unknown): boolean => {
  if (error instanceof ServiceValidationError) return true
  if (error instanceof PayloadValidationError) return true
  if (error instanceof APIError && error.status === 400) return true
  return false
}

export const subscriptionsHandler: PayloadHandler = async (req: PayloadRequest) => {
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

  const { action, email, topics, ref, lang } = (body ?? {}) as {
    action?: 'subscribe' | 'update' | 'unsubscribeAll'
    email?: string
    topics?: string[]
    ref?: string | null
    lang?: string | null
  }

  if (!action || !email) return badRequest()

  const topicsList = isNonEmptyStringArray(topics) ? topics : undefined

  if (action === 'subscribe' || action === 'update') {
    if (!topicsList) return badRequest()
  }

  logInfo({ msg: 'Subscriptions submit endpoint hit.' })

  const ctx = { payload: req.payload, logger: payloadLogger }

  try {
    if (action === 'subscribe') {
      await subscribe(ctx, { action, email, topics: topicsList!, ref, lang })
      return okResponse()
    }

    if (action === 'unsubscribeAll') {
      await unsubscribeAll(ctx, { action, email })
      return okResponse()
    }

    if (action === 'update') {
      return badRequest()
    }

    return badRequest()
  } catch (error) {
    if (isBadRequestError(error)) {
      logError({
        msg: 'Subscriptions endpoint rejected request (bad request).',
        action,
        email,
        topics,
        ref,
        lang,
        error: error instanceof Error ? error.message : String(error),
      })
      return badRequest()
    }

    logError({
      msg: 'Subscriptions endpoint failed.',
      action,
      email,
      topics,
      ref,
      lang,
      error: error instanceof Error ? error.message : String(error),
    })
    return serverError()
  }
}
