import React, { Fragment } from 'react'

import type { Page } from '@shna/shared/payload-types'

import { CallToActionBlock } from '@shna/shared/blocks/CallToAction/Component'
import { ContentBlock } from '@shna/shared/blocks/Content/Component'
import { MediaBlock } from '@shna/shared/blocks/MediaBlock/Component'
import type { Locale } from '@shna/shared/utilities/locale'

const blockComponents = {
  content: ContentBlock,
  cta: CallToActionBlock,
  mediaBlock: MediaBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  locale?: Locale
}> = (props) => {
  const { blocks, locale } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer locale={locale} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
