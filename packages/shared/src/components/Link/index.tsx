import { Button, type ButtonProps } from '@shna/shared/components/ui/button'
import { cn } from '@shna/shared/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  locale?: Locale
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages'
    value: Page | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    locale,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const prefixPath = (path?: string | null) => {
    if (!locale || !path || !path.startsWith('/')) return path
    if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return path
    if (path.startsWith('/share')) return path
    return `/${locale}${path === '/' ? '' : path}`
  }

  const rawHref =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug === 'home' ? '' : reference.value.slug
        }`
      : url
  const href = prefixPath(rawHref)

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
