import type { Metadata } from 'next'

import { requireUser } from '@/lib/session'

import Sidebar from './_components/sidebar'

export const metadata: Metadata = {
  title: 'Dashboard | PandorLabs',
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The proxy only checks that a session cookie exists. This is the check that
  // actually validates it.
  const session = await requireUser()

  return (
    <div className="lg:flex lg:min-h-screen">
      <Sidebar user={{ name: session.user.name, email: session.user.email }} />

      <main className="min-w-0 grow px-6 py-8 lg:px-10">{children}</main>
    </div>
  )
}
