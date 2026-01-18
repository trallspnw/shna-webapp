import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'allowIndexing',
      label: 'Allow search engines to index the site',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'When enabled, search engines can crawl and index the public site. When disabled, they are asked to stop crawling, which may reduce search visibility until re-enabled. Changing this setting requires a site rebuild.',
      },
    },
  ],
}
