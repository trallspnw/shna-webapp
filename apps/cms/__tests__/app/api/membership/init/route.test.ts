import { CONSTANTS } from "@/apps/cms/__tests__/constants";
import { POST } from "@/apps/cms/src/app/api/membership/init/route";
import { initMembership } from "@/apps/cms/src/dao/membershipDao";
import { createSession } from "@/apps/cms/src/lib/stripe";
import { NextRequest } from "next/server";

const EXPECTED_SESSION_CREATE = expect.objectContaining({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: CONSTANTS.itemName,
        },
        unit_amount: CONSTANTS.monetaryAmountInCents,
      },
      quantity: 1,
    },
  ],
  email: CONSTANTS.email,
  success_url: expect.stringContaining('/orderSuccess'),
  cancel_url: expect.stringContaining('/orderFailed'),
  language: CONSTANTS.language,
  metadata: {
    householdId: CONSTANTS.generalId,
    email: CONSTANTS.email,
    itemName: CONSTANTS.itemName,
    itemType: CONSTANTS.itemTypeMembership,
    entryUrl: CONSTANTS.generalUrl,
    ref: CONSTANTS.ref,
  },
})

jest.mock('/src/lib/globalsUtil', () => ({
  getMembershipSettings: jest.fn(() => Promise.resolve({
    membershipPrices: { individual: Number(CONSTANTS.monetaryAmount) },
    maxHouseholdSize: 5,
  })),
}))

jest.mock('/src/dao/membershipDao', () => ({
  initMembership: jest.fn(() => Promise.resolve({ 
    success: true,
    householdId: CONSTANTS.generalId,
  })),
}))

jest.mock('/src/lib/stripe', () => ({
  createSession: jest.fn(() => Promise.resolve({ url: CONSTANTS.stripeUrl }))
}))

describe('POST /api/membership/init', () => {

  it('Valid inputs _ 200, donation initialized', async () => {
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
        membershipType: 'INDIVIDUAL',
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(200)
    const json = await result.json()
    expect(json.paymentUrl).toBe(CONSTANTS.stripeUrl)

    expect(initMembership).toHaveBeenCalledTimes(1)
    expect(initMembership).toHaveBeenCalledWith({
      membershipType: 'INDIVIDUAL',
      primaryContact: {
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone,
        address: CONSTANTS.address,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      },
      householdName: undefined,
      members: [],
      maxHouseholdSize: 5,
    })

    expect(createSession).toHaveBeenCalledTimes(1)
    expect(createSession).toHaveBeenCalledWith(EXPECTED_SESSION_CREATE)
  })

  it('Valid inputs with 11 digit phone _ 200, donation initialized', async () => {
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone11Diget,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
        membershipType: 'INDIVIDUAL',
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(200)
    const json = await result.json()
    expect(json.paymentUrl).toBe(CONSTANTS.stripeUrl)

    expect(initMembership).toHaveBeenCalledTimes(1)
    expect(initMembership).toHaveBeenCalledWith({
      membershipType: 'INDIVIDUAL',
      primaryContact: {
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone,
        address: CONSTANTS.address,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      },
      householdName: undefined,
      members: [],
      maxHouseholdSize: 5,
    })

    expect(createSession).toHaveBeenCalledTimes(1)
    expect(createSession).toHaveBeenCalledWith(EXPECTED_SESSION_CREATE)
  })

  it('Missing name _ 400', async () => {
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.email,
        phone: CONSTANTS.phone11Diget,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(400)

    expect(initMembership).not.toHaveBeenCalled()
    expect(createSession).not.toHaveBeenCalled()
  })

  it('Invalid email _ 400', async () => {
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.invalidEmail,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone11Diget,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(400)

    expect(initMembership).not.toHaveBeenCalled()
    expect(createSession).not.toHaveBeenCalled()
  })

  it('Invalid phone _ 400', async () => {
    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.invalidEmail,
        name: CONSTANTS.name,
        phone: CONSTANTS.invalidPhone,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(400)

    expect(initMembership).not.toHaveBeenCalled()
    expect(createSession).not.toHaveBeenCalled()
  })

  it('Active membership _ 400', async () => {
    (initMembership as jest.Mock).mockResolvedValue({ 
      success: false,
      reason: CONSTANTS.activeMembershipReason,
    })

    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(400)

    expect(createSession).not.toHaveBeenCalled()
  })

  it('DAO error returned _ 500', async () => {
    (initMembership as jest.Mock).mockResolvedValue({ success: false })

    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(500)

    expect(createSession).not.toHaveBeenCalled()
  })

  it('Internal error _ 500', async () => {
    (createSession as jest.Mock).mockRejectedValue(new Error())

    const result = await POST(new Request(CONSTANTS.requestUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        itemName: CONSTANTS.itemName,
        email: CONSTANTS.email,
        name: CONSTANTS.name,
        phone: CONSTANTS.phone,
        address: CONSTANTS.address,
        entryUrl: CONSTANTS.generalUrl,
        language: CONSTANTS.language,
        ref: CONSTANTS.ref,
      }),
      headers: CONSTANTS.apiHeaders,
    }) as NextRequest)

    expect(result.status).toBe(500)
  })

})
