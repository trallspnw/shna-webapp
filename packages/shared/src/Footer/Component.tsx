import { getCachedGlobal } from '@shna/shared/utilities/getGlobals'
import React from 'react'
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react'

import type { Footer } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { CMSLink } from '@shna/shared/components/Link'

type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin'

const SOCIAL_ICONS: Record<SocialPlatform, React.FC<{ className?: string }>> = {
  facebook: ({ className }) => <Facebook className={className} />,
  instagram: ({ className }) => <Instagram className={className} />,
  twitter: ({ className }) => <Twitter className={className} />,
  youtube: ({ className }) => <Youtube className={className} />,
  linkedin: ({ className }) => <Linkedin className={className} />,
}

type Props = {
  draft?: boolean
  headers?: HeadersInit
  locale?: Locale
}

export async function Footer({ draft = false, headers, locale }: Props = {}) {
  let footerData: Footer | null = null
  try {
    footerData = await getCachedGlobal('footer', 1, draft, headers, locale)()
  } catch {
    // CMS temporarily unreachable; render with defaults
  }

  const navItems = footerData?.navItems || []
  const orgName = footerData?.orgName || 'Friends of Seminary Hill Natural Area'
  const quickLinksLabel = footerData?.quickLinksLabel || 'Quick Links'
  const socialLinksLabel = footerData?.socialLinksLabel || 'Follow the Hill'
  const tagline =
    footerData?.tagline ||
    'Volunteer-led. Community-rooted. Protecting 80 acres of Pacific Northwest woodland in the heart of Centralia, Washington.'
  const copyright =
    footerData?.copyright || `Seminary Hill Natural Area \u00A9 ${new Date().getFullYear()}`
  const socialLinks = footerData?.socialLinks || []

  return (
    <footer className="bg-header text-header-foreground">
      <div className="mx-auto max-w-[86rem] px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Column 1: Org name + tagline */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white">{orgName}</h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-header-foreground/70">
              {tagline}
            </p>
          </div>

          {/* Column 2: Quick links */}
          {navItems.length > 0 && (
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-header-foreground/50">
                {quickLinksLabel}
              </h4>
              <ul className="mt-4 flex flex-col gap-2" role="list">
                {navItems.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      locale={locale}
                      appearance="inline"
                      className="font-sans text-sm text-header-foreground/70 transition-colors hover:text-white no-underline"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 3: Social links */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-header-foreground/50">
                {socialLinksLabel}
              </h4>
              <div className="mt-4 flex items-center gap-4">
                {socialLinks.map(({ platform, url, id }) => {
                  if (!url) return null
                  const Icon = SOCIAL_ICONS[platform as SocialPlatform]
                  if (!Icon) return null
                  const label = platform.charAt(0).toUpperCase() + platform.slice(1)
                  return (
                    <a
                      key={id ?? url}
                      href={url}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-header-foreground/10 text-header-foreground/70 transition-colors hover:bg-header-foreground/20 hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-header-foreground/10">
        <div className="mx-auto max-w-[86rem] px-4 py-4 lg:px-8">
          <p className="text-center font-sans text-xs text-header-foreground/50">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
