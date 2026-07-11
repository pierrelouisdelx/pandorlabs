import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { auth } from './auth'

/** Per-request memoised session lookup — layout and page share one DB read. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

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
