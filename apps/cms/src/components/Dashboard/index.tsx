import { Gutter } from '@payloadcms/ui/elements/Gutter'
import { CollectionCards } from '@payloadcms/ui/rsc'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

const Dashboard = async ({ initPageResult }: AdminViewServerProps) => {
  const { req } = initPageResult

  return (
    <Gutter left right className="dashboard__content">
      <CollectionCards req={req} widgetSlug="collections" />
    </Gutter>
  )
}

export default Dashboard
