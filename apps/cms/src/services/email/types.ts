export type EmailLanguage = 'en' | 'es'

export type SendTemplatedEmailRequest = {
  templateSlug: string
  toEmail: string
  locale?: EmailLanguage
  params: Record<string, unknown>
  contactId?: string | number | null
}

export type SendTemplatedEmailResult = {
  ok: boolean
  reason?:
    | 'missing_recipient'
    | 'template_not_found'
    | 'template_inactive'
    | 'missing_placeholders'
    | 'render_error'
    | 'provider_failed'
  emailSendId?: string | number
}
