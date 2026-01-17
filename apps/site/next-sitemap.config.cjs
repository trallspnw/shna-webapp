const resolveVercelURL = (value) => (value ? `https://${value}` : undefined)

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  resolveVercelURL(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  'https://example.com'

const CMS_URL =
  process.env.NEXT_PUBLIC_CMS_URL ||
  process.env.CMS_PUBLIC_URL ||
  resolveVercelURL(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  'http://localhost:3000'

const fetchCollection = async (collection) => {
  const url = new URL(`/api/${collection}`, CMS_URL)
  url.searchParams.set('limit', '1000')
  url.searchParams.set('pagination', 'false')
  url.searchParams.set('depth', '0')

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Failed to fetch ${collection} for sitemap`)
  }

  return response.json()
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
  },
  additionalPaths: async (config) => {
    const [pages, posts] = await Promise.all([
      fetchCollection('pages'),
      fetchCollection('posts'),
    ])

    const pagePaths = pages.docs
      .filter((page) => page.slug && page.slug !== 'home')
      .map((page) => ({
        loc: `${config.siteUrl}/${page.slug}`,
        lastmod: page.updatedAt,
      }))

    const postPaths = posts.docs.map((post) => ({
      loc: `${config.siteUrl}/posts/${post.slug}`,
      lastmod: post.updatedAt,
    }))

    return [
      {
        loc: `${config.siteUrl}/`,
        priority: 1.0,
      },
      ...pagePaths,
      ...postPaths,
    ]
  },
}
