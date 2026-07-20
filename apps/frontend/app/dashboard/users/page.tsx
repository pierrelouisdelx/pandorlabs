import { db, session as sessionTable, user } from '@pandorlabs/db'
import { and, desc, eq, gt, sql } from 'drizzle-orm'

import { requireAdmin } from '@/lib/session'

import UsersView from './users-view'

// Accounts change at any time and the page is behind auth, so there is nothing
// to cache — always read the current rows.
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  // Lives under the dashboard layout, which only guarantees a signed-in user.
  // User management is admin-only, so this page re-checks the role itself.
  const session = await requireAdmin()

  // One row per user plus a count of their currently-active sessions, so the
  // table can show who is signed in without a second round-trip.
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      activeSessions: sql<number>`count(${sessionTable.id})`.mapWith(Number),
    })
    .from(user)
    .leftJoin(
      sessionTable,
      and(
        eq(sessionTable.userId, user.id),
        gt(sessionTable.expiresAt, new Date()),
      ),
    )
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))

  const adminCount = rows.filter((row) => row.role === 'admin').length

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Users</h1>
        <p className="text-gray mt-2 text-sm">
          {rows.length} account{rows.length === 1 ? '' : 's'} · {adminCount}{' '}
          admin{adminCount === 1 ? '' : 's'}
        </p>
      </div>

      <UsersView
        users={rows}
        currentUserId={session.user.id}
        adminCount={adminCount}
      />
    </>
  )
}
