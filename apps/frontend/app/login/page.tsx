import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/session'

import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Sign in | PandorLabs',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const session = await getSession()

  // Already signed in? Skip the form — but only send them somewhere they are
  // actually allowed to be, or they bounce straight back here.
  if (session) {
    const home =
      session.user.role === 'admin' ? '/admin/emails' : '/dashboard'
    redirect(safeNext(next) ?? home)
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
        <p className="text-gray mb-8 text-sm">
          Access your PandorLabs panel.
        </p>

        {error === 'forbidden' && (
          <p className="mb-6 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
            That account does not have admin access.
          </p>
        )}

        <LoginForm next={safeNext(next)} />
      </div>
    </main>
  )
}

/**
 * Only same-origin paths — never bounce a signed-in user to another site.
 * Returns undefined when there is no usable target, so the caller picks a
 * destination the user's role can actually reach.
 */
function safeNext(next?: string): string | undefined {
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return next
  }
  return undefined
}
