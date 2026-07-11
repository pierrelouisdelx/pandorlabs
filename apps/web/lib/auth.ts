import { account, db, session, user, verification } from '@pandorlabs/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

import { appUrl, isProduction, serverEnv } from './env'

export const auth = betterAuth({
  appName: 'PandorLabs',
  baseURL: appUrl,
  secret: serverEnv.betterAuthSecret,
  // Origins are checked against `baseURL`, so a dev server that falls back to
  // another port (3000 taken -> 3001) would 403 every request. Trust any origin
  // in development; production keeps the strict `baseURL`-only check.
  trustedOrigins: isProduction ? [] : ['*'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // Accounts are created only by `pnpm db:seed-admin`. Leaving the public
    // sign-up endpoint open would let anyone create rows in `user`.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      // `input: false` keeps role out of any client-supplied payload, so it
      // cannot be escalated through sign-up or update-user.
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh a session at most once a day
  },
  // Must stay last: it writes Better Auth's Set-Cookie headers through the
  // Next.js cookies() API so server actions can establish a session.
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
