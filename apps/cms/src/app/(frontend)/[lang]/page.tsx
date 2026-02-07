import PageTemplate, { generateMetadata as generateSlugMetadata } from './[slug]/page'

type Params = { params: Promise<{ lang: string }> }

export default async function Page({ params }: Params) {
  const { lang } = await params
  return <PageTemplate params={Promise.resolve({ lang, slug: 'home' })} />
}

export async function generateMetadata({ params }: Params) {
  const { lang } = await params
  return generateSlugMetadata({ params: Promise.resolve({ lang, slug: 'home' }) })
}
