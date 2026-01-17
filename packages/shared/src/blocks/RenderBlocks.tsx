import React, { Fragment } from 'react'

import type { Page } from '@shna/shared/payload-types'

import { ArchiveBlock } from '@shna/shared/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@shna/shared/blocks/CallToAction/Component'
import { ContentBlock } from '@shna/shared/blocks/Content/Component'
import { FormBlock } from '@shna/shared/blocks/Form/Component'
import { MediaBlock } from '@shna/shared/blocks/MediaBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

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
                  <Block {...block} disableInnerContainer />
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
