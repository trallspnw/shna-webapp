import type { Transaction, Contact, MembershipTerm } from '@shna/shared/payload-types'
import { format } from 'date-fns'

export const generateReceiptEmail = (transaction: Transaction) => {
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    transaction.amountUSD || 0,
  )
  const date = transaction.occurredAt ? format(new Date(transaction.occurredAt), 'MMM d, yyyy') : ''
  const idSnippet = transaction.stripeId ? `(Ref: ${transaction.stripeId.slice(-8)})` : ''

  const subject = `Receipt for your payment to Seminary Hill Natural Area`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Payment Receipt</h1>
      <p>Thank you for your support!</p>
      <p>We received <strong>${amount}</strong> on ${date}.</p>
      <p><small>${idSnippet}</small></p>
      <hr />
      <p>Seminary Hill Natural Area</p>
    </div>
  `

  return { subject, html }
}

export const generateMembershipEmail = (
  contact: Contact,
  term: MembershipTerm,
  planName: string,
) => {
  const expires = term.expiresAt ? format(new Date(term.expiresAt), 'MMM d, yyyy') : 'Never'

  const subject = `Welcome to Seminary Hill Natural Area!`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Membership Confirmation</h1>
      <p>Hi ${contact.displayName || 'Friend'},</p>
      <p>Thank you for becoming a member (Plan: ${planName}).</p>
      <p>Your membership is active until <strong>${expires}</strong>.</p>
      <p>Your support helps us maintain the trails and organize events.</p>
      <hr />
      <p>Seminary Hill Natural Area</p>
    </div>
  `

  return { subject, html }
}
