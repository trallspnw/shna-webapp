import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { LocalizedText } from '../types/language'
import { resolveLocalizedText } from '../lib/translation'
import { Button, Group, Loader, Modal, Stack, TextInput, Text } from '@mantine/core'
import classes from './EmailForm.module.scss'
import { isValidEmail } from '../lib/validation'

type EmailFormProps = {
  emailLabel?: LocalizedText
  emailPlaceholder?: LocalizedText
  emailValidationError?: LocalizedText
  submitButtonText: LocalizedText
  successHeading: LocalizedText
  successMessage: LocalizedText
  failureHeading: LocalizedText
  failureMessage: LocalizedText
  actionHandler:  (email: string) => Promise<boolean>
}

/**
 * A component which includes only an email input and a submit button. Accepts localized texts for rendering the UI and 
 * an action handler.
 */
export function EmailForm({
  emailLabel,
  emailPlaceholder,
  emailValidationError,
  submitButtonText,
  successHeading,
  successMessage,
  failureHeading,
  failureMessage,
  actionHandler,
}: EmailFormProps) {
  const [language] = useLanguage()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      
      // Emails should be validated on the backend, but validation is here to prevent extra processing.
      if (!isValidEmail(email)) {
        setEmailError(resolveLocalizedText(emailValidationError, language, 'Invalid email'))
        setLoading(false)
        return
      }
  
      setEmailError(null)
      setModalOpen(true)
  
      try {
        const result = await actionHandler(email)
        setIsSuccess(result)
      } catch {
        setIsSuccess(false)
      } finally {
        setLoading(false)
      }
    }

  const heading = isSuccess
    ? resolveLocalizedText(successHeading, language)
    : resolveLocalizedText(failureHeading, language)

  const message = isSuccess
    ? resolveLocalizedText(successMessage, language)
    : resolveLocalizedText(failureMessage, language)

    return (
    <>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Group gap="xs" wrap="wrap" align="end" justify='flex-end'>
          <TextInput
            label={resolveLocalizedText(emailLabel, language, 'Email')}
            placeholder={resolveLocalizedText(emailPlaceholder, language) ?? undefined}
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
          <Button 
            type="submit"
            variant="filled"
            className={classes.button}
            loading={loading}
          >
            {resolveLocalizedText(submitButtonText, language)}
          </Button>
        </Group>
      </form>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setIsSuccess(null)
          setLoading(false)
        }}
        title={loading ? '' : heading}
        centered
      >
        {loading ? (
          <Stack align="center" py="xl">
            <Loader />
          </Stack>
        ) : (
          <Text style={{ whiteSpace: 'pre-line' }}>
            {message}
          </Text>
        )}
      </Modal>
    </>
  )

}
