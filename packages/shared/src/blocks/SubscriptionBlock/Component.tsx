'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'

import type { ContainerBlock } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { DEFAULT_LOCALE, getStoredLocale } from '@shna/shared/utilities/locale'
import { getPublicApiBaseUrl } from '@shna/shared/utilities/getURL'
import { ensureStoredLocale, getSessionRef } from '@shna/shared/client/storage'

type SubscriptionBlockType = Extract<
  NonNullable<NonNullable<ContainerBlock['columns']>[number]['blocks']>[number],
  { blockType: 'subscriptionBlock' }
>

type SubscriptionBlockProps = SubscriptionBlockType

type Props = SubscriptionBlockProps & {
  locale?: Locale
  disableInnerContainer?: boolean
}

type ModalState = 'idle' | 'loading' | 'success' | 'error'

export type SubscriptionPayload = {
  action: 'subscribe'
  email: string
  topics: string[]
  ref: string | null
  lang: string
}

export const buildSubscriptionPayload = (input: {
  email: string
  topics?: string[] | null
  ref?: string | null
  lang?: string | null
}): SubscriptionPayload => {
  const topics = input.topics?.filter(Boolean) ?? []

  return {
    action: 'subscribe',
    email: input.email,
    topics: topics.length > 0 ? topics : ['general'],
    ref: input.ref ?? null,
    lang: input.lang ?? DEFAULT_LOCALE,
  }
}

export const SubscriptionBlock: React.FC<Props> = ({
  header,
  description,
  topics,
  buttonLabel,
  emailLabel,
  modalTitle,
  loadingText,
  successText,
  errorText,
  closeLabel,
  locale,
}) => {
  const [renderLocale, setRenderLocale] = useState<Locale>(locale ?? DEFAULT_LOCALE)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const effectiveTopics = useMemo(() => {
    return Array.isArray(topics) && topics.length > 0 ? topics : ['general']
  }, [topics])

  const copy = {
    buttonLabel: buttonLabel || 'Subscribe',
    emailLabel: emailLabel || 'Email',
    modalTitle: modalTitle || 'Subscribing...',
    loadingText: loadingText || 'Submitting your request...',
    successText: successText || "You're subscribed.",
    errorText: errorText || 'Something went wrong. Please try again.',
    closeLabel: closeLabel || 'Close',
  }

  useEffect(() => {
    if (locale) {
      ensureStoredLocale(locale)
      setRenderLocale(locale)
      return
    }

    const stored = getStoredLocale()
    if (stored) {
      setRenderLocale(stored)
    }
  }, [locale])

  const submit = async () => {
    setFormError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setFormError('Please enter your email.')
      return
    }

    setIsSubmitting(true)

    try {
      const baseUrl = getPublicApiBaseUrl()
      const payload = buildSubscriptionPayload({
        email: trimmedEmail,
        topics: effectiveTopics,
        ref: getSessionRef() ?? null,
        lang: renderLocale,
      })

      const response = await fetch(`${baseUrl}/api/public/subscriptions/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setFormError(copy.errorText)
        return
      }

      setModalState('success')
    } catch {
      setFormError(copy.errorText)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 shadow-md ring-1 ring-border">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15">
        <Mail className="h-6 w-6 text-secondary" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-xl font-semibold text-card-foreground">
        {header || 'Email subscription'}
      </h2>
      {description && (
        <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}

      {modalState === 'success' ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-lg bg-secondary/10 p-4">
          <p className="text-center font-sans text-sm font-medium text-secondary-foreground">
            {copy.successText}
          </p>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-1 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-sm font-medium text-card-foreground">
              {copy.emailLabel}
              <span className="text-primary ml-1" aria-hidden="true">*</span>
            </span>
            <input
              className={`rounded-lg border px-3 py-2.5 font-sans text-sm bg-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${formError ? 'border-destructive' : 'border-border'}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="mt-auto pt-2">
            <button
              className="w-full rounded-lg bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  aria-hidden="true"
                />
              )}
              <span>{isSubmitting ? copy.loadingText : copy.buttonLabel}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
