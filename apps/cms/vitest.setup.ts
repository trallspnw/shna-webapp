// Any setup scripts you might need go here

// Load .env files (prefer .env.test)
import dotenv from 'dotenv'
import path from 'path'

const rootEnvTest = path.resolve(__dirname, '../../.env.test')
const rootEnv = path.resolve(__dirname, '../../.env')

dotenv.config({ path: rootEnvTest, override: true })
dotenv.config({ path: rootEnv })

if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'test-payload-secret'
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for tests. Set it in .env.test or .env.')
}
