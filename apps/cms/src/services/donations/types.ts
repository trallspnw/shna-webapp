import type { Payload } from 'payload'

export type Logger = {
  warn: (message: string, meta?: Record<string, unknown>) => void
}

export type ServiceCtx = {
  payload: Payload
  logger?: Logger
}

export type SubmitDonationInput = {
  email: string
  name?: string | null
  phone?: string | null
  addressText?: string | null
  amountUSD: string | number
  lang: string
  ref?: string | null
  checkoutName?: string | null
  entryUrl?: string | null
}

export type SubmitDonationResult = {
  ok: true
  url: string
  publicOrderId: string
}

export type OrderStatusInput = {
  publicOrderId: string
}

export type OrderStatusResult = {
  ok: true
  status: 'created' | 'paid' | 'expired' | 'error'
  terminal: boolean
  totalUSD: number
}

export class ValidationError extends Error {
  details?: Record<string, unknown>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}
