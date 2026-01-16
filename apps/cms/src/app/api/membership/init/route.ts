import { initMembership } from "@/apps/cms/src/dao/membershipDao";
import { createSession } from "@/apps/cms/src/lib/stripe";
import { isValidEmail, isValidUsPhone } from "@/packages/common/src/lib/validation";
import { NextRequest, NextResponse } from "next/server";
import { getMembershipSettings } from "@/apps/cms/src/lib/globalsUtil";
import { MembershipType } from "@prisma";

/**
 * API route for member sign up.
 * @param request Person contact information
 * @returns A Stripe session URL or failure message
 */
export async function POST(request: NextRequest) {
  try {
    // Get membership price from payload
    const { membershipPrices, maxHouseholdSize } = await getMembershipSettings()

    const { itemName, email, name, phone, address, entryUrl, language, ref, membershipType, householdName, members } = await request.json()

    // Normalize input
    const cleaned = {
      itemName: clean(itemName),
      email: clean(email),
      name: clean(name),
      phone: clean(phone),
      address: clean(address),
      entryUrl: clean(entryUrl),
      householdName: clean(householdName),
      membershipType: clean(membershipType),
    }

    // Validate input
    const selectedType = cleaned.membershipType === 'FAMILY' ? MembershipType.FAMILY : MembershipType.INDIVIDUAL
    const amount = selectedType === 'FAMILY'
      ? membershipPrices?.family
      : membershipPrices?.individual

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid membership price' }, 
        { status: 500 }
      )
    }

    if (!cleaned.email || !isValidEmail(cleaned.email)) {
      return NextResponse.json(
        { error: 'Invalid email' }, 
        { status: 400 }
      )
    }

    if (!cleaned.name) {
      return NextResponse.json(
        { error: 'Invalid name' }, 
        { status: 400 }
      )
    }

    // Phone is not required, but it must be valid if provided
    if (cleaned.phone && !isValidUsPhone(cleaned.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone' }, 
        { status: 400 }
      )
    }

    if (cleaned.phone) cleaned.phone = cleaned.phone.slice(-10)

    const additionalMembers = Array.isArray(members) ? members : []
    for (const member of additionalMembers) {
      if (member.email && !isValidEmail(member.email)) {
        return NextResponse.json(
          { error: 'Invalid additional member email' },
          { status: 400 },
        )
      }
      if (member.phone && !isValidUsPhone(member.phone)) {
        return NextResponse.json(
          { error: 'Invalid additional member phone' },
          { status: 400 },
        )
      }
      if (member.phone) {
        member.phone = member.phone.slice(-10)
      }
    }

    const result = await initMembership({
      membershipType: selectedType,
      primaryContact: {
        email: cleaned.email,
        name: cleaned.name,
        phone: cleaned.phone,
        address: cleaned.address,
        language,
        ref,
      },
      householdName: cleaned.householdName,
      members: additionalMembers,
      maxHouseholdSize,
    })

    if (!result.success) {
      // DAO didn't add because there is an active membership - user error
      if (result.reason === 'ACTIVE_MEMBERSHIP') {
        return NextResponse.json(
          { error: result.reason },
          { status: 400 }
        )
      }

      if (result.reason === 'MAX_HOUSEHOLD_SIZE') {
        return NextResponse.json(
          { error: result.reason },
          { status: 400 }
        )
      }

      // Some other unknown error.
      console.error('Failed to initialize a membership: ', result);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
      );
    }

    // Kickoff Stripe session
    const session = await createSession({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: cleaned.itemName ?? 'Membership',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }
      ],
      email: cleaned.email,
      success_url: `${process.env.FRONT_END_URL}/orderSuccess?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_END_URL}/orderFailed?sessionId={CHECKOUT_SESSION_ID}`,
      language: language,
      metadata: {
        householdId: result.householdId ?? '',
        email: cleaned.email,
        itemName: cleaned.itemName ?? 'Membership',
        itemType: 'MEMBERSHIP',
        entryUrl: cleaned.entryUrl ?? '',
        ref: ref ?? '',
      },
    })

    return NextResponse.json(
      { paymentUrl: session.url },
      { status: 200 },
    )

  } catch (e) {
    console.error('Error in membership handler:', e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// Helper for cleaning / normalizing input
function clean(value: string): string | undefined {
  return value?.trim() === '' ? undefined : value
}
