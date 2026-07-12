import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Optimistic redirect only. This checks that a session cookie is *present*, it
 * does not validate the session or the role — the proxy runtime has no DB
 * access. Authorization is enforced in `requireAdmin()` / `requireUser()`,
 * which every guarded page and every guarded server action calls.
 *
 * `proxy.ts` is the Next 16 replacement for the deprecated `middleware.ts`.
 */
export default function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
