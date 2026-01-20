import { RequiredDataFromCollectionSlug } from 'payload'

export const contact: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'contact',
    _status: 'published',
    hero: {
      type: 'none',
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            enableLink: false,
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Contact',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    tag: 'h2',
                    version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Email us at info@seminaryhillnaturalarea.org.',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    textFormat: 0,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
      },
    ],
    title: 'Contact',
  }
}
