import { Client } from 'pg'

const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  console.error('[db] DATABASE_URL is required to ensure media.prefix')
  process.exit(1)
}

const client = new Client({ connectionString: DATABASE_URL })

const columnExistsQuery = `
  select 1
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'media'
    and column_name = 'prefix'
  limit 1;
`

try {
  await client.connect()
  const result = await client.query(columnExistsQuery)
  if (result.rowCount && result.rowCount > 0) {
    console.info('[db] media.prefix already present')
  } else {
    await client.query('ALTER TABLE public.media ADD COLUMN IF NOT EXISTS prefix TEXT;')
    console.info('[db] media.prefix column added')
  }
} catch (error) {
  console.error('[db] ensure media.prefix failed', error)
  process.exitCode = 1
} finally {
  await client.end()
}
