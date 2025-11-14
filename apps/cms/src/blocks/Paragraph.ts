import { Block } from "payload";
import { createLocalizedTextField } from "@cms/fields/localizedTextField";

/**
 * A block for displaying a localized paragraph.
 */
export const Paragraph: Block = {
  slug: 'paragraph',
  interfaceName: 'Paragraph',
  labels: {
    singular: 'Paragraph',
    plural: 'Paragraphs',
  },
  fields: [
    createLocalizedTextField('text', 'Paragraph Text', true),
  ],
}
