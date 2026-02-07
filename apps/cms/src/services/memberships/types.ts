import type { Payload } from 'payload'

export type Logger = {
  warn: (message: string, meta?: Record<string, unknown>) => void
  info?: (message: string, meta?: Record<string, unknown>) => void
  error?: (message: string, meta?: Record<string, unknown>) => void
}

export type ServiceCtx = {
  payload: Payload
  logger?: Logger
}

export type SubmitMembershipInput = {
  email: string
  name?: string | null
  phone?: string | null
  address?: string | null
  planSlug: string
  language?: string | null
  ref?: string | null
  checkoutName?: string | null
  entryUrl?: string | null
}

export type SubmitMembershipResult = {
  ok: true
  url: string
  publicOrderId: string
}

export type ManualPaymentMethod = 'cash' | 'check'

export type SubmitMembershipManualInput = {
  email: string
  name: string
  planSlug: string
  paymentMethod: ManualPaymentMethod
  locale?: string | null
}

export type SubmitMembershipManualResult = {
  ok: true
  publicOrderId: string
  orderId: string
  membershipId?: string
}

export class ValidationError extends Error {
  details?: Record<string, unknown>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}
