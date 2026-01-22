import * as Brevo from '@getbrevo/brevo'

// Initialize API instance
// Note: In real usage we might need to instantiate TransactionalEmailsApi, ContactsApi etc separately.
// The SDK structure varies. Let's assume standard V3 structure.

const apiKey = process.env.BREVO_API_KEY || ''
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@seminaryhillnaturalarea.org'
const senderName = 'Seminary Hill Natural Area'

// Singleton-ish instances
let transactionalApi: Brevo.TransactionalEmailsApi | null = null
let contactsApi: Brevo.ContactsApi | null = null

function getTransactionalApi() {
  if (!transactionalApi) {
    transactionalApi = new Brevo.TransactionalEmailsApi()
    transactionalApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)
  }
  return transactionalApi
}

function getContactsApi() {
  if (!contactsApi) {
    contactsApi = new Brevo.ContactsApi()
    contactsApi.setApiKey(Brevo.ContactsApiApiKeys.apiKey, apiKey)
  }
  return contactsApi
}

export type SendEmailArgs = {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<boolean> {
  if (!apiKey) {
    console.warn('BREVO_API_KEY not set, skipping email send')
    return false
  }

  const api = getTransactionalApi()
  const email = new Brevo.SendSmtpEmail()

  email.sender = { email: senderEmail, name: senderName }
  email.to = [{ email: to }]
  email.subject = subject
  email.htmlContent = html
  email.textContent = text

  try {
    await api.sendTransacEmail(email)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function syncContactToList(
  email: string,
  listId: number,
  attributes?: Record<string, any>,
) {
  if (!apiKey) return

  const api = getContactsApi()
  const createContact = new Brevo.CreateContact()

  createContact.email = email
  createContact.listIds = [listId]
  createContact.attributes = attributes
  createContact.updateEnabled = true // Update if exists

  try {
    await api.createContact(createContact)
    return true
  } catch (error: any) {
    console.error('Error syncing contact to list:', error?.body || error)
    return false
  }
}
