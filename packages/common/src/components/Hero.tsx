// Adapted from https://ui.mantine.dev/category/hero/

'use client'

import { useLanguage } from '@common/hooks/useLanguage'
import { resolveLocalizedText, resolveLocalizedValue } from '@common/lib/translation'
import { LocalizedMedia, LocalizedText } from '@common/types/language'
import clsx from 'clsx'
import { Overlay, Title, Text, Container } from '@mantine/core'
import classes from './Hero.module.scss'
import { toPublicMediaUrl } from '@common/lib/mediaUtil'
import { Action } from './Action'
import { Action as ActionType } from '@common/types/payload-types'

type HeroProps = {
  heading: LocalizedText
  subheading?: LocalizedText
  media: LocalizedMedia
  actions?: ActionType[]
  className?: string
}

/**
 * Hero component intended for use on the homepage. Accepts headings, media, and CTAs (Call To Action).
 */
export function Hero({ heading, subheading, media, actions = [], className }: HeroProps) {
  const [language] = useLanguage()
  const localizedMedia = resolveLocalizedValue(media, language)

  return (
    <div className={classes.container}>
      <div
        className={clsx(classes.wrapper, className)}
        style={{
          backgroundImage: localizedMedia ? `url(${toPublicMediaUrl(localizedMedia.src)})` : undefined
        }}
      >
        <Overlay color="#000" opacity={0.65} zIndex={1} />

        <div className={classes.inner}>
          <Title className={classes.title}>
            {resolveLocalizedText(heading, language)}
          </Title>

          <Container>
            <Text size="lg" className={classes.description}>
              {resolveLocalizedText(subheading, language)}
            </Text>
          </Container>

          
          {actions.length > 0 && (
            <div className={classes.controls}>
              {actions.map((action, index) => (
                <Action 
                  key={index}
                  size='lg'
                  {... action}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
