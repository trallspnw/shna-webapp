import type { Block, Field } from 'payload'

import { link } from '@shna/shared/fields/link'
import { richTextField } from '@shna/shared/blocks/RichTextBlock/richTextField'
import { columnSizeOptions } from '@shna/shared/blocks/columns'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: columnSizeOptions.map(({ label, value }) => ({ label, value })),
  },
  richTextField(),
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
