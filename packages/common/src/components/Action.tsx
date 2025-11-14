'use client'

import { Anchor, Button, ButtonVariant } from '@mantine/core'
import { resolveLocalizedText } from '@common/lib/translation'
import { useLanguage } from '@common/hooks/useLanguage'
import { CustomActionKey, customActions } from '@common/lib/customActions'
import { LocalizedText } from '../types/language'
import classes from './Action.module.scss'
import clsx from 'clsx'

const variantMap: Record<string, ButtonVariant> = {
  primary: 'filled',
  secondary: 'light',
  subtle: 'subtle',
}

type ActionProps = {
  label: LocalizedText
  style: string
  actionType: string
  size?: string
  url?: string | null
  customActionKey?: CustomActionKey | null
  className?: string
}

/**
 * An action component. Accept style and action details. Supports links and custom actions.
 */
export function Action({ label, style, actionType, size='md', url, customActionKey, className }: ActionProps) {
  const [language] = useLanguage()
  const resolvedLabel = resolveLocalizedText(label, language)
  const isButtonStyle = typeof style === 'string' && style in variantMap
  const variant = isButtonStyle
    ? variantMap[style as keyof typeof variantMap]
    : undefined

  if (actionType === 'custom' && customActionKey) {
    const handler = customActions[customActionKey]?.handler
    if (!handler) return null

    return isButtonStyle ? (
      <Button 
        variant={variant} 
        size={size} 
        onClick={handler} 
        className={clsx(classes.action, className)}
      >
        {resolvedLabel}
      </Button>
    ) : (
      <Anchor 
        href="#" 
        onClick={e => { e.preventDefault(); handler() }}
        className={clsx(classes.action, className)}
      >
        {resolvedLabel}
      </Anchor>
    )
  }

  if (url) {
    return isButtonStyle ? (
      <Button 
        variant={variant} 
        size={size} 
        component="a" 
        href={url}
        className={clsx(classes.action, className)}
      >
        {resolvedLabel}
      </Button>
    ) : (
      <Anchor 
        href={url}
        className={clsx(classes.action, className)}
      >
        {resolvedLabel}
      </Anchor>
    )
  }

  return null
}
