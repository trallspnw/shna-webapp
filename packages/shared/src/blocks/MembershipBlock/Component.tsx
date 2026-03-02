'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Users } from 'lucide-react'

import type { ContainerBlock, MembershipPlan } from '@shna/shared/payload-types'
import type { Locale } from '@shna/shared/utilities/locale'
import { DEFAULT_LOCALE, getStoredLocale } from '@shna/shared/utilities/locale'
import { getPublicApiBaseUrl } from '@shna/shared/utilities/getURL'
import { ensureStoredLocale, getSessionRef } from '@shna/shared/client/storage'

type MembershipBlockType = Extract<
  NonNullable<NonNullable<ContainerBlock['columns']>[number]['blocks']>[number],
  { blockType: 'membershipBlock' }
>

type MembershipBlockProps = MembershipBlockType

type Props = MembershipBlockProps & {
  locale?: Locale
  disableInnerContainer?: boolean
}

type ModalState = 'idle' | 'loading' | 'success' | 'error'

type MembershipPlanOption = {
  id: number
  slug: string
  name: string
  price: number
  renewalWindowDays: number
}

export type MembershipPayload = {
  email: string
  name?: string | null
  phone?: string | null
  address?: string | null
  planSlug: string
  language: string
  ref: string | null
  checkoutName?: string | null
  entryUrl: string
}

export const buildMembershipPayload = (input: {
  email: string
  name?: string | null
  phone?: string | null
  address?: string | null
  planSlug: string
  language?: string | null
  ref?: string | null
  checkoutName?: string | null
  entryUrl: string
}): MembershipPayload => {
  return {
    email: input.email,
    name: input.name ?? null,
    phone: input.phone ?? null,
    address: input.address ?? null,
    planSlug: input.planSlug,
    language: input.language ?? DEFAULT_LOCALE,
    ref: input.ref ?? null,
    checkoutName: input.checkoutName ?? null,
    entryUrl: input.entryUrl,
  }
}

const formatCurrency = (value: number, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

export const MembershipBlock: React.FC<Props> = ({
  header,
  description,
  buttonLabel,
  nameLabel,
  emailLabel,
  phoneLabel,
  addressLabel,
  planLabel,
  plans,
  defaultPlan,
  modalTitle,
  loadingText,
  successText,
  errorText,
  closeLabel,
  checkoutName,
  locale,
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [planSlug, setPlanSlug] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pollTimeoutRef = useRef<number | null>(null)

  const [renderLocale, setRenderLocale] = useState<Locale>(locale ?? DEFAULT_LOCALE)

  const copy = {
    buttonLabel: buttonLabel || 'Join',
    nameLabel: nameLabel || 'Name',
    emailLabel: emailLabel || 'Email',
    phoneLabel: phoneLabel || 'Phone',
    addressLabel: addressLabel || 'Address',
    planLabel: planLabel || 'Plan',
    modalTitle: modalTitle || 'Processing your membership...',
    loadingText: loadingText || 'Submitting your membership...',
    successText: successText || 'Thank you for becoming a member.',
    errorText: errorText || 'Something went wrong. Please try again.',
    closeLabel: closeLabel || 'Close',
  }

  const checkoutNameValue = checkoutName?.trim()

  const planOptions = useMemo(() => {
    const list = (plans ?? [])
      .map((plan) => {
        if (!plan || typeof plan !== 'object') return null
        const typed = plan as MembershipPlan
        const price = typeof typed.price === 'number' ? typed.price : Number(typed.price)
        if (!typed.slug || !typed.name || !Number.isFinite(price)) return null
        return {
          id: typed.id,
          slug: typed.slug,
          name: typed.name,
          price,
          renewalWindowDays:
            typeof typed.renewalWindowDays === 'number'
              ? typed.renewalWindowDays
              : Number(typed.renewalWindowDays),
        }
      })
      .filter((plan): plan is MembershipPlanOption => Boolean(plan))

    return list.map((plan) => ({
      ...plan,
      label: `${plan.name} — ${formatCurrency(plan.price, renderLocale)}`,
    }))
  }, [plans, renderLocale])

  const defaultPlanSlug = useMemo(() => {
    if (defaultPlan && typeof defaultPlan === 'object' && 'slug' in defaultPlan) {
      return (defaultPlan as MembershipPlan).slug ?? null
    }
    return null
  }, [defaultPlan])

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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const params = new URLSearchParams(window.location.search)
    const modal = params.get('modal')
    const stripeRedirect = params.get('stripeRedirect')
    const publicOrderId = params.get('publicOrderId')

    if (modal === 'membership' && stripeRedirect === '1' && publicOrderId) {
      setIsModalOpen(true)
      setModalState('loading')
      pollOrderStatus(publicOrderId)
    }

    return () => {
      clearPollTimeout()
    }
  }, [])

  useEffect(() => {
    const initial =
      defaultPlanSlug ||
      planOptions.find((plan) => plan.slug === 'individual')?.slug ||
      planOptions[0]?.slug ||
      ''
    if (!initial) return
    setPlanSlug((current) => current || initial)
  }, [planOptions, defaultPlanSlug])

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()
    const trimmedName = name.trim()

    if (!trimmedEmail) {
      setFormError('Please provide an email.')
      return
    }

    if (!trimmedName) {
      setFormError('Please provide a name.')
      return
    }

    if (!planSlug) {
      setFormError('Please select a plan.')
      return
    }

    setIsSubmitting(true)

    try {
      const baseUrl = getPublicApiBaseUrl()
      const entryUrl = window.location.href

      const payload = buildMembershipPayload({
        email: trimmedEmail,
        name: trimmedName,
        phone: phone.trim() || null,
        address: address.trim() || null,
        planSlug,
        language: renderLocale,
        ref: getSessionRef() ?? null,
        checkoutName: checkoutNameValue || null,
        entryUrl,
      })

      const response = await fetch(`${baseUrl}/api/public/memberships/submit`, {
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

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 shadow-md ring-1 ring-border">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-header/15">
        <Users className="h-6 w-6 text-header" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-xl font-semibold text-card-foreground">
        {header || 'Membership checkout'}
      </h2>
      {description && (
        <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}

      <form className="mt-6 flex flex-1 flex-col gap-4" onSubmit={onSubmit}>
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

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-sm font-medium text-card-foreground">
            {copy.nameLabel}
            <span className="text-primary ml-1" aria-hidden="true">*</span>
          </span>
          <input
            className={`rounded-lg border px-3 py-2.5 font-sans text-sm bg-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${formError ? 'border-destructive' : 'border-border'}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-sm font-medium text-card-foreground">{copy.phoneLabel}</span>
          <input
            className="rounded-lg border border-border px-3 py-2.5 font-sans text-sm bg-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-sm font-medium text-card-foreground">{copy.addressLabel}</span>
          <textarea
            className="rounded-lg border border-border px-3 py-2.5 font-sans text-sm bg-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            rows={2}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-sm font-medium text-card-foreground">
            {copy.planLabel}
            <span className="text-primary ml-1" aria-hidden="true">*</span>
          </span>
          <select
            className="rounded-lg border border-border px-3 py-2.5 font-sans text-sm bg-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            value={planSlug}
            onChange={(event) => setPlanSlug(event.target.value)}
            disabled={planOptions.length === 0}
            required
          >
            {planOptions.length === 0 ? (
              <option value="">No plans available</option>
            ) : (
              planOptions.map((plan) => (
                <option key={plan.slug} value={plan.slug}>
                  {plan.label}
                </option>
              ))
            )}
          </select>
        </label>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="mt-auto pt-2">
          <button
            className="w-full rounded-lg bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-60"
            type="submit"
            disabled={isSubmitting || planOptions.length === 0}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <div className="font-serif text-lg font-semibold mb-2">{copy.modalTitle}</div>
            <p className="font-sans text-sm">
              {modalState === 'loading' && copy.loadingText}
              {modalState === 'success' && copy.successText}
              {modalState === 'error' && copy.errorText}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="rounded-lg border border-border bg-background px-4 py-2 font-sans text-sm hover:bg-muted/50"
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
