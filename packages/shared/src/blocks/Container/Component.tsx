import React from 'react'

import type { ContainerBlock as ContainerBlockProps, Media } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'

import { cn } from '@shna/shared/utilities/ui'
import { getMediaUrl, getMediaUrlFromPrefix } from '@shna/shared/utilities/getMediaUrl'

import { CallToActionBlock } from '@shna/shared/blocks/CallToAction/Component'
import { DonationBlock } from '@shna/shared/blocks/DonationBlock/Component'
import { MembershipBlock } from '@shna/shared/blocks/MembershipBlock/Component'
import { MediaBlock } from '@shna/shared/blocks/MediaBlock/Component'
import { SubscriptionBlock } from '@shna/shared/blocks/SubscriptionBlock/Component'
import { RichTextBlock } from '@shna/shared/blocks/RichTextBlock/Component'
import { getColumnSpanValue } from '@shna/shared/blocks/columns'

type Props = ContainerBlockProps & {
  locale?: Locale
}

type ColumnBlock = NonNullable<
  NonNullable<ContainerBlockProps['columns']>[number]['blocks']
>[number]

const blockComponents: Record<string, React.FC<any>> = {
  richTextBlock: RichTextBlock,
  mediaBlock: MediaBlock,
  cta: CallToActionBlock,
  donationBlock: DonationBlock,
  membershipBlock: MembershipBlock,
  subscriptionBlock: SubscriptionBlock,
}

const outerSpacingClasses: Record<NonNullable<Props['outerSpacingY']>, string> = {
  none: 'py-0',
  sm: 'py-6',
  md: 'py-12',
  lg: 'py-20',
}

const innerPaddingClasses: Record<NonNullable<Props['innerPadding']>, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-8',
  lg: 'p-12',
}

const lgStartClasses: Record<number, string> = {
  1: 'lg:col-start-1',
  2: 'lg:col-start-2',
  3: 'lg:col-start-3',
  4: 'lg:col-start-4',
  5: 'lg:col-start-5',
  6: 'lg:col-start-6',
  7: 'lg:col-start-7',
  8: 'lg:col-start-8',
  9: 'lg:col-start-9',
  10: 'lg:col-start-10',
  11: 'lg:col-start-11',
  12: 'lg:col-start-12',
}

const resolveMediaUrl = (media?: Media | number | null) => {
  if (!media || typeof media !== 'object') return null
  const prefix = 'prefix' in media ? (media as { prefix?: string | null }).prefix : undefined
  const fromPrefix = getMediaUrlFromPrefix(prefix, media.filename, media.updatedAt)
  return fromPrefix || getMediaUrl(media.url, media.updatedAt) || null
}

export const ContainerBlock: React.FC<Props> = (props) => {
  const {
    widthMode,
    backgroundVariant,
    backgroundColor,
    backgroundMedia,
    backgroundFit,
    overlayStrength,
    outerSpacingY,
    innerPadding,
    columns,
    locale,
  } = props

  const resolvedOuterSpacing =
    outerSpacingY ?? (backgroundVariant && backgroundVariant !== 'none' ? 'none' : 'md')

  const resolvedInnerPadding = innerPadding ?? 'md'

  const backgroundImageUrl = backgroundVariant === 'image' ? resolveMediaUrl(backgroundMedia) : null
  const overlayOpacity =
    typeof overlayStrength === 'number' && overlayStrength > 0
      ? Math.min(1, overlayStrength / 100)
      : 0

  const innerWidthClass =
    widthMode === 'page' ? 'max-w-[var(--maxPageWidth)]' : 'max-w-[var(--contentMaxWidth)]'

  const columnSpans = (columns || []).map((column) => Number(getColumnSpanValue(column.size)))
  const totalSpan = columnSpans.reduce((sum, span) => sum + (Number.isFinite(span) ? span : 0), 0)
  const lgStart = totalSpan > 0 && totalSpan < 12 ? Math.floor((12 - totalSpan) / 2) + 1 : null
  const lgStartClass = lgStart ? lgStartClasses[lgStart] : undefined

  return (
    <section
      className={cn('w-full relative', outerSpacingClasses[resolvedOuterSpacing])}
      style={backgroundVariant === 'color' && backgroundColor ? { backgroundColor } : undefined}
    >
      {backgroundVariant === 'image' && backgroundImageUrl && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className={cn('absolute inset-0 bg-center bg-no-repeat', {
              'bg-cover': backgroundFit !== 'contain',
              'bg-contain': backgroundFit === 'contain',
            })}
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          {overlayOpacity > 0 && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity }}
            />
          )}
        </div>
      )}

      <div className={cn('relative w-full mx-auto', innerWidthClass, innerPaddingClasses[resolvedInnerPadding])}>
        <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
          {(columns || []).map((column, columnIndex) => {
            const spanValue = getColumnSpanValue(column.size)
            const columnBlocks = column.blocks || []

            return (
              <div
                key={columnIndex}
                className={cn(`col-span-4 lg:col-span-${spanValue}`, {
                  'md:col-span-2': column.size ? column.size !== 'full' : false,
                  [lgStartClass || '']: columnIndex === 0 && Boolean(lgStartClass),
                })}
              >
                <div className="flex flex-col gap-6">
                  {columnBlocks.map((block: ColumnBlock, blockIndex: number) => {
                    if (!block || !('blockType' in block)) return null
                    const Block = blockComponents[block.blockType]
                    if (!Block) return null
                    return (
                      <Block
                        key={`${block.blockType}-${blockIndex}`}
                        {...block}
                        disableInnerContainer
                        locale={locale}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
