import { createLocalReq, getPayload } from 'payload'
import type { Payload, PayloadRequest } from 'payload'
import config from '@payload-config'

export type TestEnv = {
  payload: Payload
  req: PayloadRequest
}

let cached: TestEnv | null = null

export const getTestEnv = async (): Promise<TestEnv> => {
  if (cached) return cached

  let payload: Payload
  try {
    payload = await getPayload({ config })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // Some dev databases drift and cause schema push failures. Retry without push for tests.
    if (process.env.PAYLOAD_MIGRATING !== 'true') {
      process.env.PAYLOAD_MIGRATING = 'true'
      payload = await getPayload({ config })
    } else {
      throw new Error(message)
    }
  }
  const req = await createLocalReq({}, payload)

  cached = { payload, req }
  return cached
}
