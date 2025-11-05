import { 
  Hero, 
  Paragraph, 
  EventCardGrid, 
  Heading, 
  Action, 
  MediaBlock, 
  TwoColumns, 
  Align, 
  Accordion, 
  MembershipStatusForm, 
  General, 
  SubscriptionForm, 
  DonationForm, 
  MembershipDuesForm,
  OrderSummary,
} from "@common/types/payload-types";
import { render as renderAccordion } from '@common/handlers/blocks/accordion'
import { render as renderAction } from '@common/handlers/blocks/action'
import { render as renderAlign } from '@common/handlers/blocks/align'
import { render as renderDonationForm } from '@common/handlers/blocks/donationForm'
import { render as renderHeading } from '@common/handlers/blocks/heading'
import { render as renderHero } from '@common/handlers/blocks/hero'
import { render as renderMedia } from '@common/handlers/blocks/media'
import { render as renderMembershipDuesForm } from '@common/handlers/blocks/membershipDuesForm'
import { render as renderMembershipStatusForm } from '@common/handlers/blocks/membershipStatusForm'
import { render as renderOrderSummary } from '@common/handlers/blocks/orderSummary'
import { render as renderParagraph } from '@common/handlers/blocks/paragraph'
import { render as renderEventCardGrid } from '@common/handlers/blocks/eventCardGrid'
import { render as renderSubscriptionForm } from '@common/handlers/blocks/subscriptionForm'
import { render as renderTwoColumns } from '@common/handlers/blocks/twoColumns'
import { JSX } from "react";
import { ContentFetcher, Fetchers, FetcherTypes } from "../fetchers/fetcher";

/**
 * Maps payload blocks to a renderer and type.
 */
export const blockRegistry = {
  accordion: {
    render: renderAccordion,
    type: {} as Accordion,
  },
  action: {
    render: renderAction,
    type: {} as Action,
  },
  align: {
    render: renderAlign,
    type: {} as Align,
  },
  donationForm: {
    render: renderDonationForm,
    type: {} as DonationForm,
  },
  eventCardGrid: {
    render: renderEventCardGrid,
    type: {} as EventCardGrid,
  },
  heading: {
    render: renderHeading,
    type: {} as Heading,
  },
  hero: {
    render: renderHero,
    type: {} as Hero,
  },
  media: {
    render: renderMedia,
    type: {} as MediaBlock,
  },
  membershipDuesForm: {
    render: renderMembershipDuesForm,
    type: {} as MembershipDuesForm,
  },
  membershipStatusForm: {
    render: renderMembershipStatusForm,
    type: {} as MembershipStatusForm,
  },
  orderSummary: {
    render: renderOrderSummary,
    type: {} as OrderSummary,
  },
  paragraph: {
    render: renderParagraph,
    type: {} as Paragraph,
  },
  subscriptionForm: {
    render: renderSubscriptionForm,
    type: {} as SubscriptionForm,
  },
  twoColumns: {
    render: renderTwoColumns,
    type: {} as TwoColumns,
  },
}

/**
 * Type from block config keys.
 */
export type BlockType = keyof typeof blockRegistry

/**
 * Type of block config.
 */
export type BlockRegistry = typeof blockRegistry

/**
 * A mapping of type (string from payload) to the generated payload type.
 */
export type BlockMap = {
  [K in BlockType]: BlockRegistry[K]['type'] & { blockType: K }
}

/**
 * A generalized block type with a render function.
 */
export type BaseBlock = BlockMap[BlockType]

/**
 * Renders blocks to JSX.
 * @param blocks The blocks to render
 * @param fetchers The available fetchers for the app environment
 * @param generalGlobals General global configuration
 * @returns 
 */
export function renderBlocks(blocks: BaseBlock[], fetchers: Fetchers, generalGlobals: General) : JSX.Element[] {
  return (
    blocks?.map((block, index) => {
      const blockType = block.blockType

      const render = blockRegistry[blockType].render as (
        block: Extract<BaseBlock, { blockType: typeof blockType }>,
        index: number,
        fetchers: Record<FetcherTypes, ContentFetcher<unknown>>,
        generalGlobals: General,
      ) => JSX.Element

      return render(block, index, fetchers, generalGlobals)
    })?.filter(Boolean) ?? []
  )
}
