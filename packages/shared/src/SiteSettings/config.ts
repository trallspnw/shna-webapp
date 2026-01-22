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
    {
      name: 'faviconSvg',
      label: 'Favicon (SVG)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional. SVG favicon preferred by modern browsers.',
      },
      filterOptions: {
        mimeType: {
          equals: 'image/svg+xml',
        },
      },
    },
    {
      name: 'faviconIco',
      label: 'Favicon (ICO)',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional fallback for older browsers.',
      },
      filterOptions: {
        mimeType: {
          in: ['image/x-icon', 'image/vnd.microsoft.icon'],
        },
      },
    },
    {
      name: 'minPageWidth',
      label: 'Min Page Width (px)',
      type: 'number',
      defaultValue: 360,
    },
    {
      name: 'maxPageWidth',
      label: 'Max Page Width (px)',
      type: 'number',
      defaultValue: 1440,
    },
    {
      name: 'contentMaxWidth',
      label: 'Content Max Width (px)',
      type: 'number',
      defaultValue: 1040,
    },
  ],
}
