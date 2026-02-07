'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import type { ContainerBlock } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { DEFAULT_LOCALE, getStoredLocale } from '@shna/shared/utilities/locale'
import { getPublicApiBaseUrl } from '@shna/shared/utilities/getURL'
import { ensureStoredLocale, getSessionRef } from '@shna/shared/client/storage'

type DonationBlockType = Extract<
  NonNullable<NonNullable<ContainerBlock['columns']>[number]['blocks']>[number],
  { blockType: 'donationBlock' }
>

type DonationBlockProps = DonationBlockType

type Props = DonationBlockProps & {
  locale?: Locale
  disableInnerContainer?: boolean
}

type ModalState = 'idle' | 'loading' | 'success' | 'error'

export type DonationPayload = {
  email: string
  name?: string | null
  phone?: string | null
  addressText?: string | null
  amountUSD: string | number
  lang: string
  ref: string | null
  checkoutName?: string | null
  entryUrl: string
}

export const buildDonationPayload = (input: {
  email: string
  name?: string | null
  phone?: string | null
  addressText?: string | null
  amountUSD: string | number
  lang?: string | null
  ref?: string | null
  checkoutName?: string | null
  entryUrl: string
}): DonationPayload => {
  return {
    email: input.email,
    name: input.name ?? null,
    phone: input.phone ?? null,
    addressText: input.addressText ?? null,
    amountUSD: input.amountUSD,
    lang: input.lang ?? DEFAULT_LOCALE,
    ref: input.ref ?? null,
    checkoutName: input.checkoutName ?? null,
    entryUrl: input.entryUrl,
  }
}

export const DonationBlock: React.FC<Props> = ({
  header,
  description,
  suggestedAmounts,
  defaultAmount,
  buttonLabel,
  nameLabel,
  emailLabel,
  phoneLabel,
  addressLabel,
  amountLabel,
  modalTitle,
  loadingText,
  successText,
  errorText,
  checkoutName,
  closeLabel,
  locale,
}) => {
  const [renderLocale, setRenderLocale] = useState<Locale>(locale ?? DEFAULT_LOCALE)
  const suggested = useMemo(() => {
    if (!Array.isArray(suggestedAmounts)) return []
    return suggestedAmounts
      .map((item) => item?.amount)
      .filter((amount): amount is number => typeof amount === 'number' && amount > 0)
  }, [suggestedAmounts])

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressText, setAddressText] = useState('')
  const [amountUSD, setAmountUSD] = useState<string>(
    typeof defaultAmount === 'number' ? String(defaultAmount) : suggested[0] ? String(suggested[0]) : '',
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pollTimeoutRef = useRef<number | null>(null)

  const copy = {
    buttonLabel: buttonLabel || 'Donate',
    nameLabel: nameLabel || 'Name',
    emailLabel: emailLabel || 'Email',
    phoneLabel: phoneLabel || 'Phone',
    addressLabel: addressLabel || 'Address',
    amountLabel: amountLabel || 'Amount (USD)',
    modalTitle: modalTitle || 'Processing your donation...',
    loadingText: loadingText || 'Submitting your donation...',
    successText: successText || 'Thank you for your donation.',
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

  const checkoutNameValue = checkoutName?.trim()

  const closeModal = () => {
    setIsModalOpen(false)
    setModalState('idle')
  }

  const clearPollTimeout = () => {
    if (pollTimeoutRef.current) {
      window.clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }

  const pollOrderStatus = async (publicOrderId: string) => {
    const baseUrl = getPublicApiBaseUrl()
    const startedAt = Date.now()

    const run = async (delayMs: number) => {
      clearPollTimeout()
      pollTimeoutRef.current = window.setTimeout(async () => {
        try {
          const response = await fetch(
            `${baseUrl}/api/public/orders/status?publicOrderId=${encodeURIComponent(publicOrderId)}`,
          )
          if (!response.ok) {
            setModalState('error')
            return
          }
          const body = (await response.json()) as {
            ok: boolean
            data?: { status?: string; terminal?: boolean }
          }
          if (!body.ok || !body.data) {
            setModalState('error')
            return
          }

          const { status, terminal } = body.data
          if (terminal) {
            setModalState(status === 'paid' ? 'success' : 'error')
            return
          }

          const elapsed = Date.now() - startedAt
          if (elapsed > 60000) {
            setModalState('error')
            return
          }

          const nextDelay = elapsed > 20000 ? 5000 : 2000
          await run(nextDelay)
        } catch {
          setModalState('error')
        }
      }, delayMs)
    }

    await run(0)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setFormError('Please provide an email.')
      return
    }

    if (!amountUSD || Number(amountUSD) <= 0) {
      setFormError('Please provide a donation amount.')
      return
    }

    setIsSubmitting(true)

    try {
      const baseUrl = getPublicApiBaseUrl()
      const entryUrl = window.location.href

      const payload = buildDonationPayload({
        email: trimmedEmail,
        name: name.trim() || null,
        phone: phone.trim() || null,
        addressText: addressText.trim() || null,
        amountUSD,
        entryUrl,
        ref: getSessionRef() ?? null,
        lang: renderLocale,
        checkoutName: checkoutNameValue || null,
      })

      const response = await fetch(`${baseUrl}/api/public/donations/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setFormError(copy.errorText)
        return
      }

      const data = (await response.json()) as { ok: boolean; data?: { url?: string } }
      if (data.ok && data.data?.url) {
        window.location.assign(data.data.url)
      } else {
        setFormError(copy.errorText)
      }
    } catch {
      setFormError(copy.errorText)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const params = new URLSearchParams(window.location.search)
    const modal = params.get('modal')
    const stripeRedirect = params.get('stripeRedirect')
    const publicOrderId = params.get('publicOrderId')

    if (modal === 'donation' && stripeRedirect === '1' && publicOrderId) {
      setIsModalOpen(true)
      setModalState('loading')
      pollOrderStatus(publicOrderId)
    }

    return () => {
      clearPollTimeout()
    }
  }, [])

  return (
    <div className="container">
      <div className="border border-border rounded p-4 max-w-xl bg-muted">
        <h2 className="text-xl font-semibold mb-2">{header || 'Donation checkout'}</h2>
        {description && <p className="text-sm mb-3">{description}</p>}
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span>
              {copy.emailLabel}
              <span className="text-red-600 ml-1">*</span>
            </span>
            <input
              className="border border-border rounded px-3 py-2 bg-background"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {copy.nameLabel}
            <input
              className="border border-border rounded px-3 py-2 bg-background"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {copy.phoneLabel}
            <input
              className="border border-border rounded px-3 py-2 bg-background"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            {copy.addressLabel}
            <textarea
              className="border border-border rounded px-3 py-2 bg-background"
              rows={3}
              value={addressText}
              onChange={(event) => setAddressText(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>
              {copy.amountLabel}
              <span className="text-red-600 ml-1">*</span>
            </span>
            <input
              className="border border-border rounded px-3 py-2 bg-background"
              type="number"
              min={1}
              step={0.01}
              value={amountUSD}
              onChange={(event) => setAmountUSD(event.target.value)}
              required
            />
          </label>

          {suggested.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              {suggested.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="border border-secondary bg-secondary text-secondary-foreground rounded px-2 py-1 hover:bg-secondary/90"
                  onClick={() => setAmountUSD(String(amount))}
                >
                  ${amount}
                </button>
              ))}
            </div>
          )}

          <button
            className="border border-primary bg-primary text-primary-foreground rounded px-3 py-2 text-sm flex items-center gap-2 w-auto self-start hover:bg-primary/90"
            type="submit"
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
        </form>
        {formError && <p className="text-sm mt-2 text-red-600">{formError}</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold mb-2">{copy.modalTitle}</div>
            <p className="text-sm">
              {modalState === 'loading' && copy.loadingText}
              {modalState === 'success' && copy.successText}
              {modalState === 'error' && copy.errorText}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="border border-secondary bg-secondary text-secondary-foreground rounded px-3 py-2 text-sm hover:bg-secondary/90"
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
