import { RequiredDataFromCollectionSlug } from 'payload'

export const contact: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'contact',
    _status: 'published',
    hero: {
      type: 'none',
    },
    layout: [],
    title: 'Contact',
  }
}
