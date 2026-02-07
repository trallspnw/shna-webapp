import { describe, expect, it } from 'vitest'

import { computeMissingPlaceholders } from '@/lib/email/renderEmail'
import { redactParamsForDiagnostics } from '@/services/email/diagnostics'

describe('email diagnostics', () => {
  it('[core] computeMissingPlaceholders treats empty strings as missing but keeps 0/false', () => {
    const template = {
      placeholders: [
        { key: 'name' },
        { key: 'amount' },
        { key: 'active' },
        { key: 'note' },
        { key: 'missingKey' },
      ],
    }
    const params = {
      name: 'Sam',
      amount: 0,
      active: false,
      note: '   ',
    }

    const missing = computeMissingPlaceholders(template, params)
    expect(missing).toEqual(['note', 'missingKey'])
  })

  it('[core] redactParamsForDiagnostics redacts email-like keys and tokens', () => {
    const snapshot = redactParamsForDiagnostics({
      emailAddress: 'test@example.com',
      token: 'secret-token',
      name: 'Sam',
      amount: 42,
      active: false,
    })

    expect(snapshot).toEqual({
      emailAddress: '[redacted]',
      token: '[redacted]',
      name: 'Sam',
      amount: 42,
      active: false,
    })
  })
})
