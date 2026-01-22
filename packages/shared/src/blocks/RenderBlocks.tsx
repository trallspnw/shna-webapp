import React, { Fragment } from 'react'

import type { Page } from '@shna/shared/payload-types'

import { ContainerBlock } from '@shna/shared/blocks/Container/Component'
import type { Locale } from '@shna/shared/utilities/locale'

const blockComponents: Record<string, React.FC<any>> = {
  container: ContainerBlock,
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
              return <Block {...block} key={index} locale={locale} />
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
