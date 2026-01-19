import fs from 'node:fs/promises'
import path from 'node:path'

const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_URL ||
  process.env.CMS_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

const OUT_DIR = path.resolve(process.cwd(), 'out')
const ROBOTS_PATH = path.join(OUT_DIR, 'robots.txt')

const fetchSiteSettings = async () => {
  const url = new URL('/api/globals/site-settings', CMS_URL)
  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Failed to fetch site settings (${response.status})`)
  }
  return response.json()
}

const buildRobots = (allowIndexing) => {
  if (!allowIndexing) {
    return ['User-agent: *', 'Disallow: /', '', `# Host`, `Host: ${SITE_URL}`, ''].join('\n')
  }

  return [
    'User-agent: *',
    'Disallow: /admin/*',
    '',
    '# Host',
    `Host: ${SITE_URL}`,
    '',
    '# Sitemaps',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}

const main = async () => {
  let allowIndexing = false

  try {
    const settings = await fetchSiteSettings()
    allowIndexing = settings?.allowIndexing === true
  } catch (error) {
    console.warn('Falling back to noindex robots.txt:', error?.message || error)
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(ROBOTS_PATH, buildRobots(allowIndexing), 'utf8')
}

await main()
