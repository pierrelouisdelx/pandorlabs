import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// Reuse the connection across hot reloads in dev, otherwise every recompile
// opens a new pool and Postgres runs out of connections.
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined
}

const client = globalForDb.client ?? postgres(connectionString)

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client
}

export const db = drizzle(client, { schema })

export * from './schema'
export { schema }
