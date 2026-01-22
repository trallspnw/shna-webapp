import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { Contacts } from './collections/Contacts'
import { Campaigns } from './collections/Campaigns'
import { SubscriptionTopics } from './collections/SubscriptionTopics'
import { Subscriptions } from './collections/Subscriptions'
import { MembershipPlans } from './collections/MembershipPlans'
import { Memberships } from './collections/Memberships'
import { Orders } from './collections/Orders'
import { OrderItems } from './collections/OrderItems'
import { Transactions } from './collections/Transactions'
import { EmailTemplates } from './collections/EmailTemplates'
import { EmailSends } from './collections/EmailSends'
import { subscriptionsHandler } from './endpoints/subscriptions'
import { donationsSubmitHandler } from './endpoints/donations'
import { membershipsSubmitHandler } from './endpoints/memberships'
import { ordersStatusHandler } from './endpoints/orders'
import { Footer } from '@shna/shared/Footer/config'
import { Header } from '@shna/shared/Header/config'
import { SiteSettings } from '@shna/shared/SiteSettings/config'
import { DonationsSettings } from '@shna/shared/DonationsSettings/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from '@shna/shared/utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const corsOrigins = [getServerSideURL(), process.env.NEXT_PUBLIC_SITE_URL].filter(
  (origin): origin is string => Boolean(origin),
)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      views: {
        dashboard: {
          Component: '@/components/Dashboard',
        },
      },
      // TODO: Decide whether to remove or SHNA-tailor the seed workflow in the admin UI.
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Pages,
    Media,
    Users,
    Contacts,
    Campaigns,
    SubscriptionTopics,
    Subscriptions,
    MembershipPlans,
    Memberships,
    Orders,
    OrderItems,
    Transactions,
    EmailTemplates,
    EmailSends,
  ],
  endpoints: [
    {
      path: '/public/subscriptions/submit',
      method: 'post',
      handler: subscriptionsHandler,
    },
    {
      path: '/public/donations/submit',
      method: 'post',
      handler: donationsSubmitHandler,
    },
    {
      path: '/public/memberships/submit',
      method: 'post',
      handler: membershipsSubmitHandler,
    },
    {
      path: '/public/orders/status',
      method: 'get',
      handler: ordersStatusHandler,
    },
  ],
  cors: corsOrigins,
  globals: [Header, Footer, SiteSettings, DonationsSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, '../../../packages/shared/src/payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
