'use client'

import { LocalizedMedia, LocalizedText } from "../types/language"
import { useLanguage } from "../hooks/useLanguage"
import { resolveLocalizedText } from '../lib/translation'
import clsx from "clsx"
import classes from './EventDetails.module.scss'
import { Heading } from "./Heading"
import { TwoColumns } from "./TwoColumns"
import { Media } from "./Media"

type EventDetailsProps = {
  heading: LocalizedText
  date: LocalizedText
  time: LocalizedText
  location: LocalizedText
  media: LocalizedMedia
  dateLabel?: LocalizedText
  timeLabel?: LocalizedText
  locationLabel?: LocalizedText
}

/**
 * Component for formatted event details
 */
export function EventDetails(props: EventDetailsProps) {
  const [language] = useLanguage()

  const leftColumn = (
    <ul key='left-details' className={clsx(classes.detailsList)}>
      <li>
        <span className={clsx(classes.listLabel)}>
          {resolveLocalizedText(props.dateLabel, language, 'Date')}:{'\u00A0'}
        </span>
        {resolveLocalizedText(props.date, language)}
      </li>
      <li>
        <span className={clsx(classes.listLabel)}>
          {resolveLocalizedText(props.timeLabel, language, 'Time')}:{'\u00A0'}
        </span>
        {resolveLocalizedText(props.time, language)}
      </li>
      <li>
        <span className={clsx(classes.listLabel)}>
          {resolveLocalizedText(props.locationLabel, language, 'Location')}:{'\u00A0'}
        </span>
        {resolveLocalizedText(props.location, language)}
      </li>
    </ul>
  )

  const rightColumn = (
    <Media key='right-media' media={props.media} radius />
  )

  return (
    <>
      <Heading 
        text={props.heading} 
        level='2'
      />
      <TwoColumns
        left={[leftColumn]}
        right={[rightColumn]}
        columnRatio='40-60'
      />
    </>
  )
}
