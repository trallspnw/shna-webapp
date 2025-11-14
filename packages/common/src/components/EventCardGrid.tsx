'use client'

import { useState } from 'react'
import { Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { EventCard } from './EventCard'
import classes from './EventCardGrid.module.scss'
import { DEFAULT_LANGUAGE, LocalizedMedia, LocalizedText } from '../types/language'
import { useLanguage } from '../hooks/useLanguage'
import { resolveLocalizedText, resolveLocalizedValue } from '../lib/translation'
import { Heading } from './Heading'

type EventDetails = {
  name: LocalizedText
  href: string
  media: LocalizedMedia 
  dateTime: Date
}

type EventCardGridProps = {
  heading?: LocalizedText
  events: EventDetails[]
  rows: number
  showMoreLabel?: LocalizedText
}

/**
 * A component for rendering EventCards in a grid. Accepts an option heading, a list of all event details, a number
 * of rows to render, and whether psuedo-pagination should be enabled (show more). Number of columns is determined by
 * window width.
 */
export function EventCardGrid({ heading, events, rows, showMoreLabel }: EventCardGridProps) {
  const [language] = useLanguage()
  
  const isLg = useMediaQuery('(min-width: 1200px)')
  const isMd = useMediaQuery('(min-width: 900px)')

  const desiredColumns = isLg ? 4 : isMd ? 3 : 2
  const columns = Math.min(desiredColumns, events.length)
  const [visibleRows, setVisibleRows] = useState(rows)
  const visibleCount = visibleRows * columns

  const visibleEvents = events.slice(0, visibleCount)
  const allEventsVisible = visibleCount >= events.length
  const renderShowMore = showMoreLabel && showMoreLabel[DEFAULT_LANGUAGE] && !allEventsVisible

  return (
    <div className={classes.wrapper}>
      {heading && <Heading text={heading} />}
      <div
        className={classes.grid}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {visibleEvents.map((event, index) => (
          <EventCard
            key={index}
            name={resolveLocalizedText(event.name, language)}
            href={event.href}
            imageSrc={resolveLocalizedValue(event.media, language)?.src ?? ''}
            date={event.dateTime}
            locale={language}
          />
        ))}
      </div>

      {renderShowMore && (
        <div className={classes.buttonContainer}>
          {renderShowMore && (
            <Button 
              variant='subtle'
              onClick={() => setVisibleRows((r) => r + 2)}
            >
              {resolveLocalizedText(showMoreLabel, language)}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
