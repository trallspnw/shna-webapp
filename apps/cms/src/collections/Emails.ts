import { CollectionConfig } from "payload";
import { createLocalizedTextField } from "../fields/localizedTextField";
import { emailBlocks } from "../lib/emailBlocks";

/**
 * Emails made of email blocks.
 */
export const Emails: CollectionConfig = {
  slug: 'emails',
  admin: {
    useAsTitle: 'internalName',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      admin: {
        description: 'Internal Identifier'
      },
      required: true,
      unique: true,
    },
    {
      name: 'internalName',
      type: 'text',
      required: true,
    },
    createLocalizedTextField('subject', 'Subject', true),
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Page Content',
      blocks: emailBlocks,
    },
  ],
}