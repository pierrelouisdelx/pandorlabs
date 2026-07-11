import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Single source of truth for env lives at the repo root, not per-workspace.
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set — copy .env.example to .env')
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
})
