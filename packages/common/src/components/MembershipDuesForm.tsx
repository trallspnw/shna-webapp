'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { LocalizedText } from '../types/language'
import { ActionIcon, Button, Group, Modal, Paper, Select, Text, Textarea, TextInput } from '@mantine/core'
import { resolveLocalizedText } from '../lib/translation'
import classes from './MembershipDuesForm.module.scss'
import { isValidEmail, isValidUsPhone } from '../lib/validation'

type DonationFormProps = {
  backendUrl: string,
  membershipPrices: {
    individual?: number | null
    family?: number | null
  }
  membershipTypeLabel?: LocalizedText
  membershipTypeIndividualLabel?: LocalizedText
  membershipTypeFamilyLabel?: LocalizedText
  householdNameLabel?: LocalizedText
  householdNamePlaceholder?: LocalizedText
  membersLabel?: LocalizedText
  addMemberLabel?: LocalizedText
  removeMemberLabel?: LocalizedText
  primaryMemberLabel?: LocalizedText
  additionalMemberLabel?: LocalizedText
  detailsHeading?: LocalizedText
  memberOptionalHelp?: LocalizedText
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
  maxHouseholdSize?: number | null
  itemName?: LocalizedText,
  existingMembershipMessage?: LocalizedText,
  serverFailureMessage?: LocalizedText,
}

/**
 * Form for membership sign up or renewal.
 */
export function MembershipDuesForm(props: DonationFormProps) {
  const [language] = useLanguage()
  const [membershipType, setMembershipType] = useState<'INDIVIDUAL' | 'FAMILY'>('INDIVIDUAL')
  const [householdName, setHouseholdName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneNormalized, setPhoneNormalized] = useState('')
  const [address, setAddress] = useState('')
  const [members, setMembers] = useState<Array<{ name: string, email: string, phone: string, phoneNormalized: string }>>([])
  const [loading, setLoading] = useState(false)

  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [maxSizeError, setMaxSizeError] = useState<string | null>(null)
  const [householdError, setHouseholdError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const handleTypeChange = (value: string | null) => {
    const next = (value as 'INDIVIDUAL' | 'FAMILY') ?? 'INDIVIDUAL'
    setMaxSizeError(null)

    if (next === 'FAMILY') {
      setMembers((prev) => {
        const primary = prev[0] || {
          name,
          email,
          phone,
          phoneNormalized,
        }
        return [
          {
            name: primary.name || name,
            email: primary.email || email,
            phone: primary.phone || phone,
            phoneNormalized: primary.phoneNormalized || phoneNormalized,
          },
          ...prev.slice(1),
        ]
      })
    } else {
      const primary = members[0]
      if (primary) {
        setName(primary.name)
        setEmail(primary.email)
        setPhone(primary.phone)
        setPhoneNormalized(primary.phoneNormalized)
      }
    }

    setMembershipType(next)
  }

  const syncPrimaryFromMembers = (list: typeof members) => {
    if (membershipType === 'FAMILY' && list[0]) {
      setName(list[0].name)
      setEmail(list[0].email)
      setPhone(list[0].phone)
      setPhoneNormalized(list[0].phoneNormalized)
    }
  }

  useEffect(() => {
    syncPrimaryFromMembers(members)
  }, [membershipType, members])

  const primaryMember = membershipType === 'FAMILY'
    ? members[0]
    : { name, email }

  const requiredFieldsValid = membershipType === 'FAMILY'
    ? Boolean(
        householdName.trim()
        && primaryMember?.name?.trim()
        && primaryMember?.email
        && isValidEmail(primaryMember.email)
        && members.every((m) => m.name.trim())
      )
    : Boolean(
        name.trim()
        && email
        && isValidEmail(email)
      )
  const maxReached = Boolean(
    membershipType === 'FAMILY'
    && props.maxHouseholdSize
    && members.length >= props.maxHouseholdSize
  )
  const maxSizeMessage = maxReached
    ? (props.maxHouseholdSize
      ? `Maximum household size of ${props.maxHouseholdSize} reached`
      : 'Maximum household size reached')
    : maxSizeError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ref = sessionStorage.getItem('ref') || undefined

    let workingMembers = members
    if (membershipType === 'FAMILY' && workingMembers.length === 0) {
      workingMembers = [{
        name,
        email,
        phone,
        phoneNormalized,
      }]
      setMembers(workingMembers)
    }

    // Validation is also performed on the backend, but validation is also done here to prevent extra processing.
    let isValid = true

    const maxHouseholdSize = props.maxHouseholdSize ?? undefined
    const totalMembers = membershipType === 'FAMILY' ? workingMembers.length : 1
    if (membershipType === 'FAMILY' && maxHouseholdSize && totalMembers > maxHouseholdSize) {
      setMaxSizeError(`Maximum household size of ${maxHouseholdSize} reached`)
      isValid = false
    } else {
      setMaxSizeError(null)
    }

    if (membershipType === 'FAMILY' && !householdName.trim()) {
      setHouseholdError(resolveLocalizedText(props.householdNameLabel, language, 'Household name') + ' required')
      isValid = false
    } else {
      setHouseholdError(null)
    }

    const primary = membershipType === 'FAMILY'
      ? workingMembers.at(0)
      : { name, email, phoneNormalized: phoneNormalized, phone }

    if (!primary?.name) {
      setEmailError(null)
      setPhoneError(null)
      setModalMessage(resolveLocalizedText(props.nameValidationError, language, 'Invalid name'))
      setModalOpen(true)
      isValid = false
    }

    if (!primary?.email || !isValidEmail(primary.email)) {
      setEmailError(resolveLocalizedText(props.emailValidationError, language, 'Invalid email'))
      isValid = false
    } else {
      setEmailError(null)
    }

    if (primary?.phone && !isValidUsPhone(primary.phoneNormalized ?? '')) {
      setPhoneError(resolveLocalizedText(props.phoneValidationError, language, 'Invalid phone'))
      isValid = false
    } else {
      setPhoneError(null)
    }

    for (const member of workingMembers) {
      if (!member.name.trim()) {
        setModalMessage(resolveLocalizedText(props.nameValidationError, language, 'Invalid name'))
        setModalOpen(true)
        isValid = false
        break
      }
      if (member.email && !isValidEmail(member.email)) {
        setModalMessage(resolveLocalizedText(props.emailValidationError, language, 'Invalid email'))
        setModalOpen(true)
        isValid = false
        break
      }
      if (member.phone && !isValidUsPhone(member.phoneNormalized)) {
        setModalMessage(resolveLocalizedText(props.phoneValidationError, language, 'Invalid phone'))
        setModalOpen(true)
        isValid = false
        break
      }
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
          membershipType,
          householdName: membershipType === 'FAMILY' ? householdName : undefined,
          email: membershipType === 'FAMILY' ? primary?.email : email, 
          name: membershipType === 'FAMILY' ? primary?.name : name, 
          phone: membershipType === 'FAMILY' ? primary?.phoneNormalized || primary?.phone : phoneNormalized || phone, 
          address,
          entryUrl: window.location.href,
          language,
          ref,
          members: membershipType === 'FAMILY'
            ? workingMembers.map((m) => ({
              name: m.name,
              email: m.email || undefined,
              phone: m.phoneNormalized || undefined,
            }))
            : [],
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

  const formatPrice = (value?: number | null) => value != null
    ? new Intl.NumberFormat(language, { style: 'currency', currency: 'USD' }).format(value)
    : undefined

  const membershipOptions = [
    {
      value: 'INDIVIDUAL',
      label: resolveLocalizedText(props.membershipTypeIndividualLabel, language, 'Individual'),
      price: props.membershipPrices.individual,
    },
    {
      value: 'FAMILY',
      label: resolveLocalizedText(props.membershipTypeFamilyLabel, language, 'Family'),
      price: props.membershipPrices.family,
    },
  ].map((opt) => ({
    value: opt.value,
    label: `${opt.label ?? opt.value}${opt.price != null ? ` – ${formatPrice(opt.price)}` : ''}`,
  }))

  return (
    <>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Group gap="xs" wrap="wrap" align="end" justify="flex-end">
          <Text fw="700" size="lg" className={classes.sectionHeading}>
            {resolveLocalizedText(props.detailsHeading, language, 'Membership details')}
          </Text>

          <Select
            label={resolveLocalizedText(props.membershipTypeLabel, language, 'Membership type')}
            data={membershipOptions}
            value={membershipType}
            onChange={handleTypeChange}
            className={classes.input}
            disabled={loading}
          />

          {membershipType === 'FAMILY' && (
            <TextInput
              label={resolveLocalizedText(props.householdNameLabel, language, 'Household name')}
              placeholder={resolveLocalizedText(props.householdNamePlaceholder, language) ?? undefined}
              value={householdName}
              onChange={(e) => setHouseholdName(e.currentTarget.value)}
              className={classes.input}
              disabled={loading}
              required
              error={householdError}
            />
          )}
          {membershipType === 'INDIVIDUAL' && (
            <>
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
            </>
          )}

          {membershipType === 'INDIVIDUAL' && (
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
          )}

          {membershipType === 'FAMILY' && (
            <div className={classes.input} style={{ width: '100%', marginTop: '0.75rem' }}>
              <Group justify="space-between" align="center" style={{ marginBottom: '0.5rem' }}>
                <Text fw="600">{resolveLocalizedText(props.membersLabel, language, 'Household members')}</Text>
              </Group>
              {members.map((member, index) => {
                const label = index === 0
                  ? resolveLocalizedText(props.primaryMemberLabel, language, 'Primary member')
                  : `${resolveLocalizedText(props.additionalMemberLabel, language, 'Member')} ${index + 1}`
                return (
                <Paper withBorder shadow="xs" p="sm" radius="md" key={index} style={{ marginBottom: '0.75rem', position: 'relative' }}>
                  <Text fw="600" size="sm" mb="xs" ta="center">{label}</Text>
                  {index > 0 && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label={resolveLocalizedText(props.removeMemberLabel, language, 'Remove')}
                      onClick={() => {
                        const updated = members.filter((_, i) => i !== index)
                        setMembers(updated)
                      }}
                      disabled={loading}
                      style={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      ×
                    </ActionIcon>
                  )}
                  <Group gap="xs" wrap="wrap" align="end" mt="xs">
                    <TextInput
                      label={resolveLocalizedText(props.nameLabel, language, 'Name')}
                      value={member.name}
                      required
                      onChange={(e) => {
                        const updated = [...members]
                        updated[index].name = e.currentTarget.value
                        setMembers(updated)
                        if (index === 0) setName(e.currentTarget.value)
                      }}
                      className={classes.input}
                      disabled={loading}
                    />
                    <TextInput
                      label={resolveLocalizedText(props.emailLabel, language, 'Email')}
                      value={member.email}
                      required={index === 0}
                      onChange={(e) => {
                        const updated = [...members]
                        updated[index].email = e.currentTarget.value
                        setMembers(updated)
                        if (index === 0) setEmail(e.currentTarget.value)
                      }}
                      error={index === 0 ? emailError : undefined}
                      className={classes.input}
                      disabled={loading}
                    />
                    <TextInput
                      label={resolveLocalizedText(props.phoneLabel, language, 'Phone')}
                      value={member.phone}
                      onChange={(e) => {
                        const updated = [...members]
                        updated[index].phone = e.currentTarget.value
                        updated[index].phoneNormalized = e.currentTarget.value.replace(/\D/g, '')
                        setMembers(updated)
                        if (index === 0) {
                          setPhone(e.currentTarget.value)
                          setPhoneNormalized(updated[index].phoneNormalized)
                        }
                      }}
                      error={index === 0 ? phoneError : undefined}
                      className={classes.input}
                      disabled={loading}
                    />
                    {index === 0 && (
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
                    )}
                  </Group>
                </Paper>
              )})}
              <Group justify="center" mt="sm">
                <Button
                  variant="subtle"
                  className={classes.addMemberButton}
                  onClick={() => {
                    if (maxReached) {
                      setMaxSizeError(null)
                      return
                    }
                    setMembers([...members, { name: '', email: '', phone: '', phoneNormalized: '' }])
                    setMaxSizeError(null)
                  }}
                  disabled={
                    loading
                    || members.some((m) => !m.name.trim())
                    || !isValidEmail(members[0]?.email || '')
                    || maxReached
                  }
                >
                  {resolveLocalizedText(props.addMemberLabel, language, 'Add member')}
                </Button>
              </Group>
              <Text c="dimmed" size="sm" ta="center" mt="xs">
                {resolveLocalizedText(props.memberOptionalHelp, language, 'Adding members now is optional. Everyone in your household will be covered.')}
              </Text>
              {maxSizeMessage && (
                <Text c={maxReached ? 'dimmed' : 'red'} size="sm" ta="center" mt="xs">
                  {maxSizeMessage}
                </Text>
              )}
            </div>
          )}
          
          <span className={classes.checkoutRow}>
            <Text fw="700">
              {resolveLocalizedText(props.priceLabel, language)}:{'\u00A0'}
              {new Intl.NumberFormat(language, {
                style: 'currency',
                currency: 'USD',
              }).format((membershipType === 'FAMILY' ? props.membershipPrices.family : props.membershipPrices.individual) ?? 0)}
            </Text>
            <Button 
              type="submit" 
              variant="filled" 
              className={classes.button}
              loading={loading}
              disabled={!requiredFieldsValid || loading}
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
