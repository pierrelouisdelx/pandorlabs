'use client'

import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from './auth'

// `inferAdditionalFields` is type-only plumbing: it teaches the client about
// the `role` field declared on the server so `session.user.role` stays typed.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signOut, useSession } = authClient
