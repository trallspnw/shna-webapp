import type { Payload } from 'payload'

export type Logger = {
  warn: (message: string, meta?: Record<string, unknown>) => void
}

export type ServiceCtx = {
  payload: Payload
  logger?: Logger
}

export type SubscriptionAction = 'subscribe' | 'update' | 'unsubscribeAll'

export type BaseInput = {
  email: string
  ref?: string | null
  lang?: string | null
}

export type SubscribeInput = BaseInput & {
  action: 'subscribe'
  topics: string[]
}

export type UpdateInput = BaseInput & {
  action: 'update'
  topics: string[]
}

export type UnsubscribeAllInput = BaseInput & {
  action: 'unsubscribeAll'
}

export type SubscriptionInput = SubscribeInput | UpdateInput | UnsubscribeAllInput

export type SubscribeResult = {
  ok: true
  contactId: string
  subscriptionIds: string[]
}

export type UnsubscribeAllResult = {
  ok: true
  contactId: string | null
  deleted: number
}

export type UpdateResult = {
  ok: false
  reason: 'not_implemented'
}

export type SubscriptionResult = SubscribeResult | UnsubscribeAllResult | UpdateResult

export class ValidationError extends Error {
  details?: Record<string, unknown>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class NotImplementedError extends Error {
  constructor(message = 'Not implemented') {
    super(message)
    this.name = 'NotImplementedError'
  }
}
