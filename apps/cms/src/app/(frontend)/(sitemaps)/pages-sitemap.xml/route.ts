import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_CMS_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap: { loc: string; lastmod: string }[] = []

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .flatMap((page) => {
            const updatedAt = page?.updatedAt
            const lastmod = updatedAt ? new Date(updatedAt).toISOString() : dateFallback
            const slugPath = page?.slug === 'home' ? '' : `/${page?.slug}`

            return ['en', 'es'].map((locale) => ({
              loc: `${SITE_URL}/${locale}${slugPath}`,
              lastmod,
            }))
          })
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
