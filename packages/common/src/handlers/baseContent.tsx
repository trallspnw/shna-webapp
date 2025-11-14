import type { Metadata } from 'next'
import type { JSX } from 'react'
import { notFound } from 'next/navigation'
import { BaseBlock, renderBlocks } from '@common/lib/blockUtil'
import { BodyLayout } from '@common/components/BodyLayout'
import { DEFAULT_LANGUAGE, LocalizedMedia, LocalizedText } from '@common/types/language'
import { resolveLocalizedText, resolveLocalizedValue } from '@common/lib/translation'
import { Footer, General } from '../types/payload-types'
import { FooterProps } from '../components/Footer'
import { createLocalizedMedia, toPublicMediaUrl } from '../lib/mediaUtil'
import { ContentFetcher, Fetchers } from '@common/fetchers/fetcher'

export type RouteParams = {
  slug: string
}

export type RouteContext = {
  params: Promise<RouteParams>
}

type ContentWithBlocks = {
  slug: string
  title?: LocalizedText
  blocks?: BaseBlock[] | null
}

export interface ContentRenderOptions<T extends ContentWithBlocks> {
  slug: string
  fetcher: ContentFetcher<T>
  fetchers: Fetchers
  renderBeforeBody?: (content: T, general: General) => JSX.Element | null
}

export interface ContentMetadataOptions<T extends ContentWithBlocks> {
  slug: string
  fetcher: ContentFetcher<T>
}

export async function renderContentPage<T extends ContentWithBlocks>({
  slug,
  fetcher,
  fetchers,
  renderBeforeBody,
}: ContentRenderOptions<T>): Promise<JSX.Element> {
  const content = await fetcher.get(slug)

  if (!content) notFound()

  const navItems = await fetcher.getNavItems()
  const footer = await fetcher.getGlobalData<Footer>('footer')
  const general = await fetcher.getGlobalData<General>('general')
  const blocks = content.blocks || []
  const [firstBlock, ...remainingBlocks] = blocks
  const isHero = firstBlock?.blockType === 'hero'
  const heroBlock = isHero ? firstBlock : null
  const bodyBlocks = isHero ? remainingBlocks : blocks
  const logo = createLocalizedMedia(general.logo)

  return (
    <BodyLayout
      logo={logo}
      navItems={navItems}
      hero={heroBlock ? renderBlocks([heroBlock], fetchers, general) : undefined}
      footer={mapFooterToProps(footer, logo)}
    >
      {renderBeforeBody?.(content, general) ?? null}
      {renderBlocks(bodyBlocks, fetchers, general)}
    </BodyLayout>
  )
}

export async function generateContentMetadata<T extends ContentWithBlocks>({
  slug,
  fetcher,
}: ContentMetadataOptions<T>): Promise<Metadata> {
  const [content, general] = await Promise.all([
    fetcher.get(slug),
    fetcher.getGlobalData<General>('general'),
  ])

  const titlePrefix = content && content.title && content.slug !== 'home'
    ? `${resolveLocalizedText(content.title, DEFAULT_LANGUAGE)} | `
    : ''
  const favicon = resolveLocalizedValue(createLocalizedMedia(general.icon), DEFAULT_LANGUAGE)

  return {
    title: `${titlePrefix}${resolveLocalizedText(general.baseTitle, DEFAULT_LANGUAGE)}`,
    icons: {
      icon: favicon ? toPublicMediaUrl(favicon.src) : undefined,
    },
    // After content is finalized, disoverability should come from collection config.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  }
}

function mapFooterToProps(footer: Footer, logo?: LocalizedMedia): FooterProps {
  return {
    logo,
    slogan: footer.slogan,
    linkGroups: (footer.linkGroups ?? []).map(group => ({
      title: group.groupName,
      links: (group.links ?? []).map(link => ({
        href: link.url,
        label: link.label,
      })),
    })),
    socialLinks: footer.socialLinks?.map(link => link.url) ?? [],
  }
}
