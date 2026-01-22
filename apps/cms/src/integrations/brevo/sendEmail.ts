import * as Brevo from '@getbrevo/brevo'

const apiKey = process.env.BREVO_API_KEY || ''
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@seminaryhillnaturalarea.org'
const senderName = 'Seminary Hill Natural Area'

let transactionalApi: Brevo.TransactionalEmailsApi | null = null

const getTransactionalApi = () => {
  if (!transactionalApi) {
    transactionalApi = new Brevo.TransactionalEmailsApi()
    transactionalApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)
  }
  return transactionalApi
}

export type SendEmailArgs = {
  to: string
  subject: string
  html: string
  text?: string
}

export type SendEmailResult = {
  ok: boolean
  messageId?: string
}

function extractMessageId(response: unknown): string | undefined {
  const r = response as any

  // Brevo SDK commonly returns: { response: IncomingMessage, body: { messageId: string } }
  const mid = r?.messageId ?? r?.body?.messageId ?? r?.response?.body?.messageId

  if (typeof mid === 'string' && mid.trim()) return mid.trim()
  return undefined
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<SendEmailResult> {
  if (!apiKey) {
    console.warn('BREVO_API_KEY not set, skipping email send')
    return { ok: false }
  }

  const api = getTransactionalApi()
  const email = new Brevo.SendSmtpEmail()

  email.sender = { email: senderEmail, name: senderName }
  email.to = [{ email: to }]
  email.subject = subject
  email.htmlContent = html
  email.textContent = text

  try {
    const response = await api.sendTransacEmail(email)
    const messageId = extractMessageId(response)
    return { ok: true, messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { ok: false }
  }
}
