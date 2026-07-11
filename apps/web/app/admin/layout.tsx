import type { Metadata } from 'next'
import Link from 'next/link'

import Logo from '@/components/layouts/logo'
import { requireAdmin } from '@/lib/session'

import SignOutButton from './sign-out-button'

export const metadata: Metadata = {
  title: 'Admin | PandorLabs',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-gray/20 border-b bg-white/5 backdrop-blur-md">
        <div className="container flex items-center gap-6 py-4 xl:max-w-(--breakpoint-xl)">
          <Logo className="shrink-0" />

          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin/emails"
              className="hover:text-green-light text-white/80 transition"
            >
              Emails
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-gray hidden text-sm sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container grow py-10 xl:max-w-(--breakpoint-xl)">
        {children}
      </main>
    </div>
  )
}
