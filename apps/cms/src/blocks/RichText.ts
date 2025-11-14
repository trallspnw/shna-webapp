import { Block } from 'payload'
import { createLocalizedRichTextField } from '../fields/localizedRichTextField'

/**
 * Localized rich text block powered by Lexical.
 */
export const RichText: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: {
    singular: 'Rich Text',
    plural: 'Rich Text Blocks',
  },
  fields: [
    createLocalizedRichTextField('content', 'Content', true),
  ],
}
