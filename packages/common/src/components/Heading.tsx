'use client'

import { Title } from '@mantine/core'
import { useLanguage } from '../hooks/useLanguage'
import { LocalizedText } from '../types/language'
import { resolveLocalizedText } from '../lib/translation'
import classes from './Heading.module.scss'
import clsx from 'clsx'

type HeadingProps = {
  text: LocalizedText
  level?: string
}

/**
 * Localized heading component.
 */
export function Heading({ text, level = '2' }: HeadingProps) {
  const [language] = useLanguage()
  const order = parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6

  return (
    <Title
      order={order}
      className={clsx(classes.heading)}
    >
      {resolveLocalizedText(text, language)}
    </Title>
  )
}
