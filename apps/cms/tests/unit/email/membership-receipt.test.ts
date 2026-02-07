import { describe, expect, it, vi } from 'vitest'

import { sendMembershipReceipt } from '@/services/email/service'

vi.mock('@/integrations/brevo/sendEmail', () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true, messageId: 'msg_1' }),
}))

describe('sendMembershipReceipt', () => {
  it('[core] uses template when membershipExpiresOn is present', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'send_1' })
    const update = vi.fn().mockResolvedValue({})
    const payload = {
      findByID: vi.fn().mockResolvedValue({ id: 'contact_1', email: 'member@example.com' }),
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'template_1',
            status: 'active',
            subject: 'Receipt {{name}}',
            body: 'Expires {{membershipExpiresOn}}',
            placeholders: [
              { key: 'name' },
              { key: 'amount' },
              { key: 'planName' },
              { key: 'emailAddress' },
              { key: 'publicOrderId' },
              { key: 'membershipExpiresOn' },
            ],
          },
        ],
      }),
      create,
      update,
    }

    const result = await sendMembershipReceipt(
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
        planName: 'Individual',
        amountUSD: 10,
        membershipEndDay: '2027-02-06T00:00:00.000Z',
      },
    )

    expect(result.ok).toBe(true)
    const sendCreate = create.mock.calls.find(
      (call) => call[0]?.collection === 'emailSends',
    )?.[0]
    expect(sendCreate?.data.templateUsed).toBe(true)
    expect(sendCreate?.data.fallbackReason).toBeNull()
    expect(sendCreate?.data.missingPlaceholders).toEqual([])
  })
})
