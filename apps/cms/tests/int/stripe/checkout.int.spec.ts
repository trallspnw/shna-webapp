import { getPayload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect, vi } from 'vitest'
import { createCheckoutSession } from '@/endpoints/createCheckoutSession'
import { handleCheckoutSessionCompleted } from '@/stripe/webhooks'
import { v4 as uuid } from 'uuid'

// Correct hoisting for mocks
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() }
})

vi.mock('stripe', () => {
  return {
    default: class {
      checkout = {
        sessions: {
          create: mockCreate,
        },
      }
    },
  }
})

describe('Stripe Integration', () => {
  let payload: any

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('ENDPOINT: creates session and intent', async () => {
    const sessionId = `cs_test_${Date.now()}_1`
    mockCreate.mockResolvedValueOnce({
      id: sessionId,
      url: 'https://checkout.stripe.com/test',
    })

    // Mock request
    const req = {
      json: async () => ({
        kind: 'donation',
        donationAmount: 50,
        stayAnon: true,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      }),
      payload,
    } as any

    const res = await createCheckoutSession(req)
    if (res.status !== 200) {
      console.error(await res.text())
    }
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.url).toBe('https://checkout.stripe.com/test')

    // Verify Intent
    const intents = await payload.find({
      collection: 'checkoutIntents',
      where: { stripeSessionId: { equals: sessionId } },
    })
    expect(intents.docs).toHaveLength(1)
    expect(intents.docs[0].kind).toBe('donation')
    expect(intents.docs[0].stayAnon).toBe(true)
  })

  it('WEBHOOK: fulfills donation (stayAnon)', async () => {
    const sessionId = `cs_test_${Date.now()}_2`
    const piId = `pi_test_${Date.now()}`

    // Create intent first (webhook relies on existing intent)
    await payload.create({
      collection: 'checkoutIntents',
      data: {
        stripeSessionId: sessionId,
        kind: 'donation',
        stayAnon: true,
        isTest: true,
      },
    })

    // Mock webhook args
    const webhookArgs = {
      event: {
        data: {
          object: {
            id: sessionId,
            customer_details: { email: 'donor@test.com' },
            payment_intent: piId,
            amount_total: 5000,
          },
        },
      },
      payload,
      stripe: {} as any,
    }

    await handleCheckoutSessionCompleted(webhookArgs)

    // Verify Transaction
    const txns = await payload.find({
      collection: 'transactions',
      where: { stripeId: { equals: piId } },
    })

    expect(txns.docs).toHaveLength(1)
    const txn = txns.docs[0]
    expect(txn.amountUSD).toBe(50)
    expect(txn.stayAnon).toBe(true)
    expect(txn.contact).toBeNull()
  })
})
