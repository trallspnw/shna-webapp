import { describe, expect, it, vi } from 'vitest'

import { sendDonationReceipt } from '@/services/email/service'

vi.mock('@/integrations/brevo/sendEmail', () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true, messageId: 'msg_1' }),
}))

describe('sendDonationReceipt diagnostics', () => {
  it('[core] stores missing placeholders when template fallback occurs', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'send_1' })
    const update = vi.fn().mockResolvedValue({})
    const payload = {
      findByID: vi.fn().mockResolvedValue({ id: 'contact_1', email: 'test@example.com' }),
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'template_1',
            status: 'active',
            placeholders: [{ key: 'name' }, { key: 'amount' }, { key: 'publicOrderId' }, { key: 'extra' }],
          },
        ],
      }),
      create,
      update,
    }

    const result = await sendDonationReceipt(
      { payload, logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } },
      {
        order: {
          id: 'order_1',
          publicId: 'order_public_1',
          totalUSD: 10,
          contact: 'contact_1',
          receiptEmailSendId: null,
          lang: 'en',
        },
      },
    )

    expect(result.ok).toBe(true)
    expect(create).toHaveBeenCalled()
    const createArgs = create.mock.calls.find(
      (call) => call[0]?.collection === 'emailSends',
    )?.[0]
    expect(createArgs).toBeDefined()
    expect(createArgs.data.fallbackReason).toBe('missing_placeholders')
    expect(createArgs.data.missingPlaceholders).toEqual(['extra'])
    expect(createArgs.data.templateUsed).toBe(false)
  })
})
