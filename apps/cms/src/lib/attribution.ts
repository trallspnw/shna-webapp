export type Attribution = {
  refRaw?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
}

export function parseAttribution(
  searchParams: Record<string, string | string[] | undefined>,
): Attribution {
  const get = (key: string): string | null => {
    const val = searchParams[key]
    if (typeof val === 'string') return val
    if (Array.isArray(val) && val.length > 0) return val[0]
    return null
  }

  return {
    refRaw: get('ref'),
    utmSource: get('utm_source'),
    utmMedium: get('utm_medium'),
    utmCampaign: get('utm_campaign'),
    utmContent: get('utm_content'),
    utmTerm: get('utm_term'),
  }
}
