'use client'

import React, { useState } from 'react'

type SubmitState = {
  submitting: boolean
  error: string | null
  publicOrderId: string | null
}

const defaultSubmitState: SubmitState = { submitting: false, error: null, publicOrderId: null }

export const ManualEntry: React.FC = () => {
  const [donationState, setDonationState] = useState<SubmitState>(defaultSubmitState)
  const [membershipState, setMembershipState] = useState<SubmitState>(defaultSubmitState)

  const [donationForm, setDonationForm] = useState({
    email: '',
    amountUSD: '',
    paymentMethod: 'cash',
    name: '',
    note: '',
    locale: 'en',
  })

  const [membershipForm, setMembershipForm] = useState({
    email: '',
    planSlug: '',
    paymentMethod: 'cash',
    name: '',
    note: '',
    locale: 'en',
  })

  const submit = async (
    url: string,
    payload: Record<string, unknown>,
    setState: React.Dispatch<React.SetStateAction<SubmitState>>,
  ) => {
    setState({ submitting: true, error: null, publicOrderId: null })
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json?.ok) {
        const error = json?.error || 'Request failed.'
        setState({ submitting: false, error, publicOrderId: null })
        return
      }

      const publicOrderId = json?.data?.publicOrderId ?? null
      setState({ submitting: false, error: null, publicOrderId })
    } catch (error) {
      setState({
        submitting: false,
        error: error instanceof Error ? error.message : 'Request failed.',
        publicOrderId: null,
      })
    }
  }

  return (
    <div style={{ border: '1px solid var(--theme-border-color)', padding: 16, borderRadius: 6 }}>
      <h3 style={{ marginTop: 0 }}>Manual Entry</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit('/api/admin/donations/submit', donationForm, setDonationState)
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <h4 style={{ marginBottom: 4 }}>Donation (Cash/Check)</h4>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Email
            <input
              required
              type="email"
              value={donationForm.email}
              onChange={(event) => setDonationForm({ ...donationForm, email: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Amount (USD)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={donationForm.amountUSD}
              onChange={(event) => setDonationForm({ ...donationForm, amountUSD: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Payment Method
            <select
              value={donationForm.paymentMethod}
              onChange={(event) => setDonationForm({ ...donationForm, paymentMethod: event.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Name (optional)
            <input
              type="text"
              value={donationForm.name}
              onChange={(event) => setDonationForm({ ...donationForm, name: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Note (optional)
            <textarea
              rows={2}
              value={donationForm.note}
              onChange={(event) => setDonationForm({ ...donationForm, note: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Locale
            <select
              value={donationForm.locale}
              onChange={(event) => setDonationForm({ ...donationForm, locale: event.target.value })}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </label>
          <button type="submit" disabled={donationState.submitting}>
            {donationState.submitting ? 'Submitting...' : 'Record Donation'}
          </button>
          {donationState.publicOrderId && (
            <div style={{ color: 'var(--theme-success-500)' }}>
              Recorded. Public Order ID: {donationState.publicOrderId}
            </div>
          )}
          {donationState.error && (
            <div style={{ color: 'var(--theme-error-500)' }}>Error: {donationState.error}</div>
          )}
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit('/api/admin/memberships/submit', membershipForm, setMembershipState)
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <h4 style={{ marginBottom: 4 }}>Membership (Cash/Check)</h4>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Email
            <input
              required
              type="email"
              value={membershipForm.email}
              onChange={(event) => setMembershipForm({ ...membershipForm, email: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Plan Slug
            <input
              required
              type="text"
              value={membershipForm.planSlug}
              onChange={(event) => setMembershipForm({ ...membershipForm, planSlug: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Payment Method
            <select
              value={membershipForm.paymentMethod}
              onChange={(event) => setMembershipForm({ ...membershipForm, paymentMethod: event.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Name
            <input
              required
              type="text"
              value={membershipForm.name}
              onChange={(event) => setMembershipForm({ ...membershipForm, name: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Note (optional)
            <textarea
              rows={2}
              value={membershipForm.note}
              onChange={(event) => setMembershipForm({ ...membershipForm, note: event.target.value })}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            Locale
            <select
              value={membershipForm.locale}
              onChange={(event) => setMembershipForm({ ...membershipForm, locale: event.target.value })}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </label>
          <button type="submit" disabled={membershipState.submitting}>
            {membershipState.submitting ? 'Submitting...' : 'Record Membership'}
          </button>
          {membershipState.publicOrderId && (
            <div style={{ color: 'var(--theme-success-500)' }}>
              Recorded. Public Order ID: {membershipState.publicOrderId}
            </div>
          )}
          {membershipState.error && (
            <div style={{ color: 'var(--theme-error-500)' }}>Error: {membershipState.error}</div>
          )}
        </form>
      </div>
    </div>
  )
}
