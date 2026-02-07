import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@payloadcms/ui/icons/Copy', () => ({
  CopyIcon: () => null,
}))

vi.mock('@shna/shared/blocks/Container/Component', () => ({
  ContainerBlock: () => React.createElement('div', { 'data-block': 'container' }),
}))

import { RenderBlocks } from '@shna/shared/blocks/RenderBlocks'

describe('RenderBlocks', () => {
  it('returns null for empty blocks', () => {
    const html = renderToStaticMarkup(React.createElement(RenderBlocks, { blocks: [] }))
    expect(html).toBe('')
  })

  it('renders container blocks without crashing', () => {
    const blocks = [
      {
        blockType: 'container',
        widthMode: 'content',
        backgroundVariant: 'none',
        innerPadding: 'md',
        outerSpacingY: 'md',
        columns: [{ size: 'full', blocks: [] }],
      },
    ]

    const html = renderToStaticMarkup(React.createElement(RenderBlocks, { blocks: blocks as any }))
    expect(html).toContain('data-block="container"')
  })
})
