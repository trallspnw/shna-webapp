import { CONSTANTS } from "@/apps/cms/__tests__/constants"
import { POST } from "@/apps/cms/src/app/api/webhooks/stripe/route"
import { completeMembership } from "@/apps/cms/src/dao/membershipDao"
import { sendEmails } from "@/apps/cms/src/lib/email"
import { getEventFromWebhookRequest } from "@/apps/cms/src/lib/stripe"
import { NextRequest } from "next/server"

const PERSON = {
  id: CONSTANTS.generalId,
  email: CONSTANTS.email,
  name: CONSTANTS.name,
}
const HOUSEHOLD = { id: CONSTANTS.generalId, primaryContact: PERSON }

jest.mock('/src/lib/stripe', () => ({
  getEventFromWebhookRequest: jest.fn(),
}))

jest.mock('/src/dao/membershipDao', () => ({
  completeMembership: jest.fn(() => Promise.resolve()),
  getHouseholdById: jest.fn(() => Promise.resolve(HOUSEHOLD)),
}))

jest.mock('/src/dao/personDao', () => ({
  getPersonById: jest.fn(() => Promise.resolve(PERSON)),
}))

jest.mock('/src/lib/email', () => ({
  sendEmails: jest.fn(() => Promise.resolve()),
}))

describe('POST /api/webhooks/stripe,', () => {

  it('Complete membership _ completes membership, emails', async () => {
    mockStripeEvent(CONSTANTS.itemTypeMembership, `${CONSTANTS.stripeEventId}_completeMembership`)
    
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: 'mock-body',
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    const json = await result.json()
    expect(json.received).toBeTruthy()

    expect(completeMembership).toHaveBeenCalledTimes(1)
    expect(completeMembership).toHaveBeenCalledWith(CONSTANTS.generalId, CONSTANTS.ref)

    expect(sendEmails).toHaveBeenCalledTimes(1)
    expect(sendEmails).toHaveBeenCalledWith(
      [ PERSON ],
      CONSTANTS.emailSlugMebership,
      {
        itemName: CONSTANTS.itemName,
        amount: CONSTANTS.monetaryAmountWithSymbol,
      },
    )
  })

  it('Complete donation _ emails', async () => {
    mockStripeEvent(CONSTANTS.itemTypeDonation, `${CONSTANTS.stripeEventId}_completeDonation`)
    
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: 'mock-body',
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    const json = await result.json()
    expect(json.received).toBeTruthy()

    expect(sendEmails).toHaveBeenCalledTimes(1)
    expect(sendEmails).toHaveBeenCalledWith(
      [ PERSON ],
      CONSTANTS.emailSlugDonation,
      {
        itemName: CONSTANTS.itemName,
        amount: CONSTANTS.monetaryAmountWithSymbol,
      },
    )

    expect(completeMembership).not.toHaveBeenCalled()
  })

  it('Bad request _ 400', async () => {
    (getEventFromWebhookRequest as jest.Mock).mockResolvedValue('error')
    
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: 'mock-body',
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(400)

    expect(completeMembership).not.toHaveBeenCalled()
    expect(sendEmails).not.toHaveBeenCalled()
  })

  it('Complete donation twice _ emails once', async () => {
    mockStripeEvent(CONSTANTS.itemTypeDonation, `${CONSTANTS.stripeEventId}_completeDonationIdempotent`)
    
    await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: 'mock-body',
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: 'mock-body',
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(sendEmails).toHaveBeenCalledTimes(1)
  })

})

function mockStripeEvent(itemType: string, eventId: string) {
  (getEventFromWebhookRequest as jest.Mock).mockResolvedValue({
    id: eventId,
    type: CONSTANTS.stripeEventType,
    data: {
      object: {
        metadata: {
          personId: CONSTANTS.generalId,
          householdId: CONSTANTS.generalId,
          email: CONSTANTS.email,
          itemName: CONSTANTS.itemName,
          itemType,
          entryUrl: CONSTANTS.generalUrl,
          ref: CONSTANTS.ref,
        },
        amount_total: CONSTANTS.monetaryAmountInCents,
      },
    }
  })
}
