import type { EmailTemplateDoc } from '@/lib/email/renderEmail'

export type TemplateResolveResult = {
  template: EmailTemplateDoc | null
  templateId: string | number | null
  templateSlug: string
  templateAttempted: boolean
  templateUsed: boolean
  fallbackReason:
    | 'template_not_found'
    | 'template_inactive'
    | 'missing_placeholders'
    | 'render_error'
    | 'skipped_already_sent'
    | null
}

const REDACT_KEY_PATTERN = /(email|token|secret|password|api[_-]?key|session|auth)/i

const redactValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    if (value.includes('@')) return '[redacted]'
    return value.length > 120 ? `${value.slice(0, 117)}...` : value
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.slice(0, 5).map(redactValue)
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 10)
    return Object.fromEntries(entries.map(([key, val]) => [key, redactValue(val)]))
  }
  return '[redacted]'
}

export const redactParamsForDiagnostics = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      REDACT_KEY_PATTERN.test(key) ? '[redacted]' : redactValue(value),
    ]),
  )
}

export const resolveTemplateOrNull = async (
  payload: any,
  templateSlug: string,
): Promise<{ template: EmailTemplateDoc | null; templateId: string | number | null; inactive: boolean }> => {
  const result = await payload.find({
    collection: 'emailTemplates',
    where: { slug: { equals: templateSlug } },
    limit: 1,
    locale: 'all',
    depth: 0,
    overrideAccess: true,
  })

  const template = result.docs[0] as EmailTemplateDoc | undefined
  if (!template) return { template: null, templateId: null, inactive: false }

  const status = (template as { status?: string | null }).status
  const inactive = status === 'disabled'
  return { template, templateId: (template as { id?: string | number }).id ?? null, inactive }
}
