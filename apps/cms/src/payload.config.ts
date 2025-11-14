import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3';

import { Admins } from './collections/Admins'
import { Events } from './collections/Events'
import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { FooterGlobal } from './globals/Footer'
import { GeneralGlobal } from './globals/General'
import { MediaFiles } from './collections/MediaFiles'
import { allBlocks } from './lib/allBlocks'
import { Emails } from './collections/Emails'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        people: {
          Component: './views/People',
          path: '/people',
          exact: true,
        },
        members: {
          Component: './views/Members',
          path: '/members',
          exact: true,
        },
        broadcast: {
          Component: './views/Broadcast',
          path: '/broadcast',
          exact: true,
        },
        campaigns: {
          Component: './views/Campaigns',
          path: '/campaigns',
          exact: true,
        },
      },
      beforeNavLinks: [
        './views/RichTextStyles#RichTextStyles',
        './views/links/Links#LinkToDashboard',
        './views/links/Links#LinkToPeople',
        './views/links/Links#LinkToMembers',
        './views/links/Links#LinkToBroadcast',
        './views/links/Links#LinkToCampaigns',
        './views/links/Links#NavSpacer',
      ],
    },
  },
  collections: [
    Admins, 
    Events,
    Media,
    MediaFiles,
    Pages, 
    Emails,
  ],
  globals: [
    FooterGlobal,
    GeneralGlobal,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, '../../../packages/common/src/types/payload-types.ts'),
    declare: false,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
  }),
  sharp,
  plugins: [
    // https://payloadcms.com/posts/guides/how-to-configure-file-storage-in-payload-with-vercel-blob-r2-and-uploadthing
    s3Storage({
      collections: {
        mediaFiles: true,
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET!,
        },
        endpoint: process.env.S3_ENDPOINT!,
        region: 'auto',
      },
    }),
  ],
  email: process.env.TYPEGEN || process.env.IMPORTMAP ? undefined : nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS ?? '',
    defaultFromName: process.env.EMAIL_FROM_NAME ?? '',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) ?? 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  blocks: allBlocks,
})
