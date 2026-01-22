import type { Block } from 'payload'

import { richTextField } from './richTextField'

export const RichTextBlock: Block = {
  slug: 'richTextBlock',
  interfaceName: 'RichTextBlock',
  fields: [richTextField()],
}
