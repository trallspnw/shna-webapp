import type { Block, Field } from 'payload'

import { CallToAction } from '@shna/shared/blocks/CallToAction/config'
import { DonationBlock } from '@shna/shared/blocks/DonationBlock/config'
import { MembershipBlock } from '@shna/shared/blocks/MembershipBlock/config'
import { MediaBlock } from '@shna/shared/blocks/MediaBlock/config'
import { SubscriptionBlock } from '@shna/shared/blocks/SubscriptionBlock/config'
import { RichTextBlock } from '@shna/shared/blocks/RichTextBlock/config'

import { columnSizeOptions } from '@shna/shared/blocks/columns'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: columnSizeOptions.map(({ label, value }) => ({ label, value })),
  },
  {
    name: 'blocks',
    type: 'blocks',
    blocks: [RichTextBlock, MediaBlock, CallToAction, DonationBlock, MembershipBlock, SubscriptionBlock],
    required: false,
  },
]

export const Container: Block = {
  slug: 'container',
  interfaceName: 'ContainerBlock',
  fields: [
    {
      name: 'widthMode',
      type: 'select',
      defaultValue: 'content',
      options: [
        { label: 'Content', value: 'content' },
        { label: 'Page', value: 'page' },
      ],
    },
    {
      name: 'backgroundVariant',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Color', value: 'color' },
        { label: 'Image', value: 'image' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.backgroundVariant === 'color',
      },
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      admin: {
        condition: (_data, siblingData) => siblingData?.backgroundVariant === 'image',
      },
    },
    {
      name: 'backgroundFit',
      type: 'select',
      defaultValue: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
      ],
      admin: {
        condition: (_data, siblingData) => siblingData?.backgroundVariant === 'image',
      },
    },
    {
      name: 'overlayStrength',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        condition: (_data, siblingData) => siblingData?.backgroundVariant === 'image',
        description: '0-100 (%) opacity applied over the background image.',
      },
    },
    {
      name: 'outerSpacingY',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
    {
      name: 'innerPadding',
      type: 'select',
      defaultValue: 'md',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
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
