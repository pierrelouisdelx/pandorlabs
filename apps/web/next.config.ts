import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import type { NextConfig } from 'next'

// Env lives at the repo root so one DATABASE_URL serves both the app and
// drizzle-kit. Next only reads .env files inside the app dir, so load it here.
config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })

const nextConfig: NextConfig = {
  transpilePackages: ['@pandorlabs/db'],
}

export default nextConfig
