import fs from 'node:fs/promises'
import path from 'node:path'

const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_URL ||
  process.env.CMS_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

const OUT_DIR = path.resolve(process.cwd(), 'out')
const HEADERS_PATH = path.join(OUT_DIR, '_headers')

const fetchSiteSettings = async () => {
  const url = new URL('/api/globals/site-settings', CMS_URL)
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Failed to fetch site settings (${response.status})`)
  }
  return response.json()
}

const buildHeaders = () => {
  return ['/*', '  X-Robots-Tag: noindex, nofollow, noarchive', ''].join('\n')
}

const main = async () => {
  let allowIndexing = false

  try {
    const settings = await fetchSiteSettings()
    allowIndexing = settings?.allowIndexing === true
  } catch (error) {
    console.warn('Falling back to noindex headers:', error?.message || error)
  }

  if (allowIndexing) {
    try {
      await fs.unlink(HEADERS_PATH)
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error
      }
    }
    return
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(HEADERS_PATH, buildHeaders(), 'utf8')
}

await main()
