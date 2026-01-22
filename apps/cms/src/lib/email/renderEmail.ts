import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { defaultRichTextValue } from '@payloadcms/richtext-lexical'
import { DEFAULT_LOCALE } from '@shna/shared/utilities/locale'

export type EmailTemplateDoc = {
  subject?: LocalizedField
  body?: LocalizedField
  placeholders?: Array<{ key?: string | null }> | null
}

type LocalizedField = Record<string, unknown> | string | null | undefined

type RenderEmailArgs = {
  template: EmailTemplateDoc
  locale?: string | null
  params?: Record<string, unknown>
}

const getParamValue = (params: Record<string, unknown>, path: string): unknown => {
  const parts = path.split('.').filter(Boolean)
  let current: unknown = params

  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

const renderTemplateString = (
  template: string,
  params: Record<string, unknown>,
  mode: 'text' | 'html',
): string => {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_match, key) => {
    const value = getParamValue(params, key)
    if (value === null || value === undefined) return ''
    const resolved = String(value)
    return mode === 'html' ? escapeHtml(resolved) : resolved
  })
}

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const getLocalizedValue = (value: LocalizedField, locale?: string | null): string => {
  if (!value) return ''
  if (typeof value === 'string') return value

  const record = value as Record<string, unknown>
  const selected = (locale && record[locale]) || record[DEFAULT_LOCALE] || ''
  return typeof selected === 'string' ? selected : ''
}

const isSerializedEditorState = (
  value: unknown,
): value is Record<string, unknown> & { root: unknown } => {
  return Boolean(value && typeof value === 'object' && 'root' in (value as object))
}

const getLocalizedRichText = (
  value: LocalizedField,
  locale?: string | null,
): (Record<string, unknown> & { root: unknown }) | null => {
  if (!value) return null
  if (isSerializedEditorState(value)) return value
  if (typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const selected = (locale && record[locale]) || record[DEFAULT_LOCALE] || null

  if (isSerializedEditorState(selected)) return selected
  return null
}

const extractTextFromNode = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const record = node as { text?: string; children?: unknown[] }
  if (typeof record.text === 'string') return record.text
  if (Array.isArray(record.children)) {
    return record.children.map(extractTextFromNode).filter(Boolean).join('')
  }
  return ''
}

const renderRichTextToText = (value: Record<string, unknown> & { root: unknown }): string => {
  const root = value.root as { children?: unknown[] } | null | undefined
  if (!root || !Array.isArray(root.children)) return ''
  const blocks = root.children
    .map((child) => extractTextFromNode(child))
    .map((text) => text.trim())
    .filter(Boolean)
  return blocks.join('\n\n')
}

export const getMissingPlaceholders = (
  template: EmailTemplateDoc,
  params: Record<string, unknown>,
): string[] => {
  const required = (template.placeholders || [])
    .map((item) => item?.key)
    .filter((value): value is string => Boolean(value))

  return required.filter((param) => {
    const value = getParamValue(params, param)
    return value === null || value === undefined || value === ''
  })
}

export const renderEmail = async ({
  template,
  locale,
  params = {},
}: RenderEmailArgs): Promise<{ subject: string; html: string; text: string }> => {
  const subjectRaw = getLocalizedValue(template.subject, locale)
  const bodyRaw = template.body
  const bodyLocalized = getLocalizedValue(bodyRaw, locale)
  const richText = bodyRaw && !bodyLocalized ? getLocalizedRichText(bodyRaw, locale) : null

  const htmlSource = bodyLocalized
    ? bodyLocalized
    : await convertLexicalToHTML({
        data: (richText ?? defaultRichTextValue) as any,
      })
  const textSource = bodyLocalized
    ? bodyLocalized
    : richText
      ? renderRichTextToText(richText)
      : ''

  const subject = renderTemplateString(subjectRaw, params, 'text')
  const html = renderTemplateString(htmlSource, params, 'html')
  const text = renderTemplateString(textSource, params, 'text')

  return { subject, html, text }
}
