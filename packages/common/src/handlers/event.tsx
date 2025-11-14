import type { JSX } from 'react'
import { Event, General } from '@common/types/payload-types'
import { EventDetails } from '../components/EventDetails'
import { SUPPORTED_LANGUAGES } from '../types/language'
import { createLocalizedMedia } from '../lib/mediaUtil'
import { ContentRenderOptions, renderContentPage } from './baseContent'

export function renderEventPage(options: ContentRenderOptions<Event>): Promise<JSX.Element> {
  return renderContentPage({
    ...options,
    renderBeforeBody: (event, general) => renderEventDetails(event, general),
  })
}

function renderEventDetails(event: Event, general: General): JSX.Element {
  const date = new Date(event.dateTime)

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }

  const formattedDate = Object.fromEntries(
    SUPPORTED_LANGUAGES.map(language => [
      language,
      new Intl.DateTimeFormat(language, dateFormatOptions).format(date),
    ]),
  )

  const formattedTime = Object.fromEntries(
    SUPPORTED_LANGUAGES.map(language => [
      language,
      new Intl.DateTimeFormat(language, timeFormatOptions).format(date),
    ]),
  )

  return (
    <EventDetails
      heading={event.title}
      date={formattedDate}
      time={formattedTime}
      location={event.location}
      media={createLocalizedMedia(event.media)}
      dateLabel={general.eventLabels?.dateLabel}
      timeLabel={general.eventLabels?.timeLabel}
      locationLabel={general.eventLabels?.locationLabel}
    />
  )
}
