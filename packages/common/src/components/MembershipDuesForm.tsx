'use client'

import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { LocalizedText } from '../types/language'
import { Button, Group, Modal, Text, Textarea, TextInput } from '@mantine/core'
import { resolveLocalizedText } from '../lib/translation'
import classes from './MembershipDuesForm.module.scss'
import { isValidEmail, isValidUsPhone } from '../lib/validation'

type DonationFormProps = {
  backendUrl: string,
  emailLabel?: LocalizedText
  emailPlaceholder?: LocalizedText
  emailValidationError?: LocalizedText
  nameLabel?: LocalizedText
  namePlaceholder?: LocalizedText
  nameValidationError?: LocalizedText
  phoneLabel?: LocalizedText
  phonePlaceholder?: LocalizedText
  phoneValidationError?: LocalizedText
  addressLabel?: LocalizedText
  addressPlaceholder?: LocalizedText
  addressValidationError?: LocalizedText
  submitButtonText: LocalizedText
  priceLabel: LocalizedText
  membershipPrice: number
  itemName?: LocalizedText,
  existingMembershipMessage?: LocalizedText,
  serverFailureMessage?: LocalizedText,
}

/**
 * Form for membership sign up or renewal.
 */
export function MembershipDuesForm(props: DonationFormProps) {
  const [language] = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneNormalized, setPhoneNormalized] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ref = sessionStorage.getItem('ref') || undefined

    // Validation is also performed on the backend, but validation is also done here to prevent extra processing.
    let isValid = true

    if (!isValidEmail(email)) {
      setEmailError(resolveLocalizedText(props.emailValidationError, language, 'Invalid email'))
      isValid = false
    } else {
      setEmailError(null)
    }

    if (phone && !isValidUsPhone(phoneNormalized)) {
      setPhoneError(resolveLocalizedText(props.phoneValidationError, language, 'Invalid phone'))
      isValid = false
    } else {
      setPhoneError(null)
    }

    if (!isValid) {
      setLoading(false)
      return
    }

    try {
      // Saves person information in preparation for payment and confirmation
      const result = await fetch(`${props.backendUrl}/api/membership/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemName: resolveLocalizedText(props.itemName, language),
          email, 
          name, 
          phone, 
          address,
          entryUrl: window.location.href,
          language,
          ref
        }),
      })

      const data = result.headers.get('content-type')?.includes('application/json') ? await result.json() : {}

      if (!result.ok) {
        if (data.error === 'ACTIVE_MEMBERSHIP') {
          setModalMessage(resolveLocalizedText(props.existingMembershipMessage, language, 'Active membership'))
        } else {
          setModalMessage(resolveLocalizedText(props.serverFailureMessage, language, 'Server error'))
        }

        setModalOpen(true)
        return
      }

      // Session created, go to Stripe payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        throw new Error('Missing Stripe Checkout URL')
      }

    } catch (err) {
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Group gap="xs" wrap="wrap" align="end" justify="flex-end">
          <TextInput
            label={resolveLocalizedText(props.nameLabel, language, 'Name')}
            placeholder={resolveLocalizedText(props.namePlaceholder, language) ?? undefined}
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value)
            }}
            required
            className={classes.input}
            disabled={loading}
          />

          <TextInput
            label={resolveLocalizedText(props.emailLabel, language, 'Email')}
            placeholder={resolveLocalizedText(props.emailPlaceholder, language) ?? undefined}
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value)
              setEmailError(null)
            }}
            error={emailError}
            required
            className={classes.input}
            disabled={loading}
          />

          <TextInput
            label={resolveLocalizedText(props.phoneLabel, language, 'Phone')}
            placeholder={resolveLocalizedText(props.phonePlaceholder, language) ?? undefined}
            value={phone}
            onChange={(e) => {
              setPhone(e.currentTarget.value)
              setPhoneNormalized(e.currentTarget.value.replace(/\D/g, ''))
              setPhoneError(null)
            }}
            error={phoneError}
            className={classes.input}
            disabled={loading}
          />

          <Textarea
            label={resolveLocalizedText(props.addressLabel, language, 'Address')}
            placeholder={resolveLocalizedText(props.addressPlaceholder, language) ?? undefined}
            autosize={true}
            minRows={3}
            value={address}
            onChange={(e) => {
              setAddress(e.currentTarget.value)
            }}
            className={classes.input}
            disabled={loading}
          />
          
          <span className={classes.checkoutRow}>
            <Text fw="700">
              {resolveLocalizedText(props.priceLabel, language)}:{'\u00A0'}
              {new Intl.NumberFormat(language, {
                style: 'currency',
                currency: 'USD',
              }).format(props.membershipPrice)}
            </Text>
            <Button 
              type="submit" 
              variant="filled" 
              className={classes.button}
              loading={loading}
            >
              {resolveLocalizedText(props.submitButtonText, language)}
            </Button>
          </span>
        </Group>
      </form>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setLoading(false)
        }}
        centered
      >
        {modalMessage}
      </Modal>
    </>
  )
}
