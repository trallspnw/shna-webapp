import { ValidationError } from './types'

type ParsedAmount = {
  amountUSD: number
  amountCents: number
  raw: string
}

const AMOUNT_REGEX = /^\d+(?:\.\d{1,2})?$/

export const parseAmountUSD = (input: string | number): ParsedAmount => {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new ValidationError('Amount must be a finite number.', { field: 'amountUSD' })
    }
    return parseAmountUSD(String(input))
  }

  if (typeof input !== 'string') {
    throw new ValidationError('Amount must be a string or number.', { field: 'amountUSD' })
  }

  const raw = input.trim()
  if (!raw || !AMOUNT_REGEX.test(raw)) {
    throw new ValidationError('Amount must be a positive number with up to 2 decimals.', {
      field: 'amountUSD',
    })
  }

  const [wholePart, decimalPart = ''] = raw.split('.')
  const paddedDecimals = (decimalPart + '00').slice(0, 2)
  const dollars = Number(wholePart)
  const cents = Number(paddedDecimals)

  if (!Number.isFinite(dollars) || !Number.isFinite(cents)) {
    throw new ValidationError('Amount is invalid.', { field: 'amountUSD' })
  }

  const amountCents = dollars * 100 + cents
  if (amountCents <= 0) {
    throw new ValidationError('Amount must be greater than zero.', { field: 'amountUSD' })
  }

  return {
    amountUSD: amountCents / 100,
    amountCents,
    raw,
  }
}

export const enforceMaxDonationUSD = (amountUSD: number, maxDonationUSD: number) => {
  if (!Number.isFinite(amountUSD)) {
    throw new ValidationError('Amount is invalid.', { field: 'amountUSD' })
  }
  if (amountUSD > maxDonationUSD) {
    throw new ValidationError('Amount exceeds maximum allowed.', {
      field: 'amountUSD',
      maxDonationUSD,
    })
  }
}
