import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { stripePlugin } from '@payloadcms/plugin-stripe'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { handleCheckoutSessionCompleted, handleCheckoutSessionExpired } from '@/webhooks/stripe'

import type { Page } from '@shna/shared/payload-types'
import { getServerSideURL } from '@shna/shared/utilities/getURL'

const getEnv = (key: string): string | undefined => process.env[key]

const r2Bucket = getEnv('R2_BUCKET')
const r2Endpoint = getEnv('R2_ENDPOINT')
const r2Region = process.env.R2_REGION || 'auto'
const r2AccessKeyId = getEnv('R2_ACCESS_KEY_ID')
const r2SecretAccessKey = getEnv('R2_SECRET_ACCESS_KEY')
const r2Prefix = process.env.R2_PREFIX || 'local'

const hasR2Config = r2Bucket && r2Endpoint && r2AccessKeyId && r2SecretAccessKey

const generateTitle: GenerateTitle<Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Seminary Hill Natural Area` : 'Seminary Hill Natural Area'
}

const generateURL: GenerateURL<Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const r2Plugin = hasR2Config
  ? s3Storage({
      bucket: r2Bucket,
      config: {
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
        endpoint: r2Endpoint,
        forcePathStyle: true,
        region: r2Region,
      },
      collections: {
        media: {
          prefix: `${r2Prefix}/media`,
        },
      },
    })
  : null

export const plugins: Plugin[] = [
  ...(r2Plugin ? [r2Plugin] : []),
  redirectsPlugin({
    collections: ['pages'],
    overrides: {
      admin: {
        hidden: true,
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  stripePlugin({
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET || '',
    webhooks: {
      'checkout.session.completed': handleCheckoutSessionCompleted,
      'checkout.session.expired': handleCheckoutSessionExpired,
    },
    // We do NOT want to auto-sync products/prices to Payload collections
    // as we have our own bespoke schema. We just use the plugin
    // for standard connection + webhooks + SDK injection.
    sync: [],
  }),
]
