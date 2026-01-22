import type { Access } from 'payload'

import { anyone } from './anyone'
import { authenticated } from './authenticated'

export const publicRead_adminWrite: { [K in 'create' | 'read' | 'update' | 'delete']: Access } = {
  create: authenticated,
  read: anyone,
  update: authenticated,
  delete: authenticated,
}
