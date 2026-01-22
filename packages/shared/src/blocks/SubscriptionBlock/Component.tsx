'use client'
import React, { useEffect, useMemo, useState } from 'react'

import type { ContainerBlock } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { DEFAULT_LOCALE, getStoredLocale } from '@shna/shared/utilities/locale'
import { getCMSURL } from '@shna/shared/utilities/getURL'
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
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const closeModal = () => {
    setIsModalOpen(false)
    setModalState('idle')
  }

  const submit = async () => {
    setFormError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setFormError('Please enter your email.')
      return
    }

    setIsSubmitting(true)

    try {
      const baseUrl = getCMSURL()
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
      setIsModalOpen(true)
    } catch {
      setFormError(copy.errorText)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <div className="border border-border rounded p-4 max-w-xl">
        <h2 className="text-xl font-semibold mb-2">{header || 'Email subscription'}</h2>
        {description && <p className="text-sm mb-3">{description}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>
              {copy.emailLabel}
              <span className="text-red-600 ml-1">*</span>
            </span>
            <input
              className={`border rounded px-3 py-2 ${formError ? 'border-red-600' : 'border-border'}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex gap-2">
            <button
              className="border border-border rounded px-3 py-2 text-sm flex items-center gap-2"
              type="button"
              onClick={submit}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-transparent"
                  aria-hidden="true"
                />
              )}
              <span>{isSubmitting ? copy.loadingText : copy.buttonLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold mb-2">{copy.modalTitle}</div>
            <p className="text-sm">
              {modalState === 'loading' && copy.loadingText}
              {modalState === 'success' && copy.successText}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="border border-border rounded px-3 py-2 text-sm"
                type="button"
                onClick={closeModal}
              >
                {copy.closeLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
