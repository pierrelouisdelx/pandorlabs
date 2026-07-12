import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { auth } from './auth'

/** Per-request memoised session lookup — layout and page share one DB read. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

/**
 * The authorization gate for the user panel: any signed-in user, any role.
 * Same contract as `requireAdmin` — every dashboard page and every dashboard
 * server action calls this, because the proxy only checks that a session cookie
 * exists, not that it is valid.
 */
export async function requireUser() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * The single authorization gate for the admin area. Every admin page and every
 * admin server action calls this — middleware only does an optimistic cookie
 * check and cannot be trusted for authorization on its own.
 */
export async function requireAdmin() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }
  if (session.user.role !== 'admin') {
    redirect('/login?error=forbidden')
  }
  return session
}
