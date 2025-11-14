'use client'

import { Accordion as MantineAccordion } from '@mantine/core'
import { LocalizedText } from '../types/language'
import { useLanguage } from '../hooks/useLanguage'
import { resolveLocalizedText } from '../lib/translation'
import type { JSX } from 'react'
import clsx from 'clsx'
import classes from './Accordion.module.scss'

type AccordionProps = {
  items: {
    title: LocalizedText
    content: JSX.Element[]
  }[]
}

/**
 * Accordion component. Accepts a list of item names and associated children for building accordion items.
 */
export function Accordion({ items }: AccordionProps) {
  const [language] = useLanguage()

  return (
    <MantineAccordion variant="default" className={clsx(classes.accordion)}>
      {items.map((item, index) => (
        <MantineAccordion.Item key={index} value={`accordion-${index}`}>
          <MantineAccordion.Control>
            {resolveLocalizedText(item.title, language)}
          </MantineAccordion.Control>
          <MantineAccordion.Panel>
            {item.content}
          </MantineAccordion.Panel>
        </MantineAccordion.Item>
      ))}
    </MantineAccordion>
  )
}
