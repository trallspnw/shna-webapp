import HomePage from '../(frontend)/[lang]/page'
import { RootLocaleRedirector } from './RootLocaleRedirector'

export default function RootPage() {
  return (
    <>
      <RootLocaleRedirector />
      <HomePage params={Promise.resolve({ lang: 'en' })} />
    </>
  )
}
