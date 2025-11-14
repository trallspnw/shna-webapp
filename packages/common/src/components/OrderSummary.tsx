'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { resolveLocalizedText } from '../lib/translation'
import { LocalizedText } from '../types/language'
import { Alert, Button, Group, List, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

type OrderSummaryProps = {
  backendUrl: string,
  heading: LocalizedText
  paidStatus: LocalizedText,
  unpaidStatus: LocalizedText,
  totalPaidLabel: LocalizedText,
  loadingText: LocalizedText,
  orderNotFoundText?: LocalizedText
  returnButtonText?: LocalizedText
  retryButtonText?: LocalizedText
}

type StripeSession = {
  id: string
  amount_total: number
  payment_status: string
  url: string
  metadata: {
    itemName?: string
    entryUrl?: string
  }
}

/**
 * Component for rendering an order summary. Intended for an order confirmation page. 
 */
export function OrderSummary({
  backendUrl,
  heading,
  paidStatus,
  unpaidStatus,
  totalPaidLabel,
  loadingText,
  orderNotFoundText,
  returnButtonText,
  retryButtonText,
}: OrderSummaryProps) {
  const [language] = useLanguage()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<StripeSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Get the Stripe sessionId from the URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('sessionId')
      if (!id) {
        setLoading(false)
      }
      setSessionId(id)
    }
  }, [])

  // Get the session details from the payment API
  useEffect(() => {
    if (!sessionId) {
      return
    }
    fetch(`${backendUrl}/api/payment?sessionId=${sessionId}`)
      .then(result => result.ok ? result.json() : null)
      .then(data => setSession(data?.sessionData ?? null))
      .finally(() => setLoading(false))
  }, [sessionId])

  let innerDetails

  // Show loadign UI
  if (loading) {
    innerDetails = (
      <Alert 
        color='blue' 
        variant='light'
      >
        <Group gap='xs' align='center'>
          <Loader size='sm' />
          <Text>{resolveLocalizedText(loadingText, language)}</Text>
        </Group>
      </Alert>
    )

  // Show order not found
  } else  if (!sessionId || (!loading && !session)) {
    innerDetails = (
     <Alert 
      icon={<IconInfoCircle />} 
      color='red' 
      variant='light'
    >
      {resolveLocalizedText(orderNotFoundText, language)}
    </Alert>
    )
    
  // Show paid or unpaid
  } else {
    const alert = session!.payment_status === 'paid' ? 
    (
      <Alert 
        icon={<IconInfoCircle />} 
        color='green' 
        variant='light'
        fw={700}
      >
        {resolveLocalizedText(paidStatus, language)}
      </Alert>
    ) : (
      <Alert 
        icon={<IconInfoCircle />} 
        color='yellow' 
        variant='light'
        fw={700}
      >
        {resolveLocalizedText(unpaidStatus, language)}
      </Alert>
    )

    innerDetails = (
      <>
        <List>
          <List.Item>
            {session!.metadata.itemName}
          </List.Item>
        </List>
        <Text fw={700}>
          {resolveLocalizedText(totalPaidLabel, language)}:{'\u00A0'}
          {new Intl.NumberFormat(language, {
            style: 'currency',
            currency: 'USD',
          }).format(session!.amount_total / 100)}
        </Text>
        {alert}
      </> 
    )
  }

  return (
    <>
      <Paper shadow='md' p='lg' withBorder>
        <Stack gap='md'>
          <Title order={4}>{resolveLocalizedText(heading, language)}</Title>
          {innerDetails}
        </Stack>
      </Paper>
       <Group justify='flex-end' mt='md'>
        {returnButtonText && session?.metadata?.entryUrl && (
          <Button
            component='a'
            href={session.metadata.entryUrl}
            variant={session.payment_status === 'paid' ? 'filled' : 'outline'}
          >
            {resolveLocalizedText(returnButtonText, language)}
          </Button>
        )}
        {retryButtonText && session?.url && (
          <Button
            component='a'
            href={session.url}
            variant='filled'
          >
            {resolveLocalizedText(retryButtonText, language)}
          </Button>
        )}
      </Group>
    </>
  )
}
