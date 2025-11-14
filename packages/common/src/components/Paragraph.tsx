'use client'

import { Text as MantineText } from '@mantine/core'
import { useLanguage } from "../hooks/useLanguage"
import { LocalizedText } from '../types/language'
import { resolveLocalizedText } from '../lib/translation'
import classes from './Paragraph.module.scss'
import clsx from 'clsx'

type ParagraphProps = {
  text: LocalizedText
}

/**
 * A paragraph component accepting LocalizedText.
 */
export function Paragraph({ text }: ParagraphProps) {
  const [language] = useLanguage()

  return (
    <MantineText className={clsx(classes.paragraph)}>
      {resolveLocalizedText(text, language)}
    </MantineText>
  )
}
