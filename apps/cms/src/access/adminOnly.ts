import type { Access } from 'payload'

import { authenticated } from './authenticated'

export const adminOnly: { [K in 'create' | 'read' | 'update' | 'delete']: Access } = {
  create: authenticated,
  read: authenticated,
  update: authenticated,
  delete: authenticated,
}
