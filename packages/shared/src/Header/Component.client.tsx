'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

import type { Header } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { setStoredLocale } from '@shna/shared/utilities/locale'
import { cn } from '@shna/shared/utilities/ui'
import { CMSLink } from '@shna/shared/components/Link'

function LanguagePill({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (next: Locale) => {
    setStoredLocale(next)
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/'))
  }

  return (
    <div
      className="flex items-center rounded-full border border-header-foreground/30 text-sm"
      role="group"
      aria-label="Language selector"
    >
      {(['en', 'es'] as Locale[]).map((l, i) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={cn(
            'px-3 py-1 font-sans text-sm transition-colors',
            i === 0 ? 'rounded-l-full' : 'rounded-r-full',
            locale === l
              ? 'bg-header-foreground/20 text-white font-medium'
              : 'text-header-foreground/70 hover:text-white',
          )}
          aria-pressed={locale === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

interface HeaderClientProps {
  data: Header
  locale?: Locale
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale = 'en' }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navItems = data?.navItems || []
  const siteName = data?.siteName || 'Seminary Hill Natural Area'

  return (
    <header className="sticky top-0 z-50 w-full bg-header" aria-label="Main navigation">
      <div className="mx-auto flex max-w-[86rem] items-center justify-between px-4 py-3 lg:px-8">
        {/* Site name */}
        <Link href={`/${locale}`} className="shrink-0">
          <span className="font-serif text-lg font-semibold tracking-tight text-white lg:text-xl">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav links */}
        {navItems.length > 0 && (
          <ul className="hidden items-center gap-8 md:flex" role="list">
            {navItems.map(({ link }, i) => (
              <li key={i}>
                <CMSLink
                  {...link}
                  locale={locale}
                  appearance="inline"
                  className="font-sans text-sm text-header-foreground/80 transition-colors hover:text-white no-underline"
                />
              </li>
            ))}
          </ul>
        )}

        {/* Desktop language pill */}
        <div className="hidden md:block">
          <LanguagePill locale={locale} />
        </div>

        {/* Mobile: language pill + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguagePill locale={locale} />
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="text-white"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-header-foreground/10 bg-header md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4" role="list">
            {navItems.map(({ link }, i) => (
              <li key={i}>
                <CMSLink
                  {...link}
                  locale={locale}
                  appearance="inline"
                  className="block rounded-lg px-3 py-2 font-sans text-base text-header-foreground/80 transition-colors hover:bg-header-foreground/10 hover:text-white no-underline"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
