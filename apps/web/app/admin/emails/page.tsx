import { db, emailReplies, emails } from '@pandorlabs/db'
import { desc } from 'drizzle-orm'

import { replyFromAddresses } from '@/lib/env'
import { requireAdmin } from '@/lib/session'

import EmailsView from './emails-view'

// Submissions arrive at any time and the page is behind auth, so there is
// nothing to cache — always read the current rows.
export const dynamic = 'force-dynamic'

export default async function EmailsPage() {
  await requireAdmin()

  const [rows, replies] = await Promise.all([
    db.select().from(emails).orderBy(desc(emails.createdAt)),
    db.select().from(emailReplies).orderBy(desc(emailReplies.createdAt)),
  ])

  const repliesByEmailId = replies.reduce<Record<string, typeof replies>>(
    (grouped, reply) => {
      ;(grouped[reply.emailId] ??= []).push(reply)
      return grouped
    },
    {},
  )

  const unreadCount = rows.filter((row) => row.status === 'unread').length

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Emails</h1>
        <p className="text-gray mt-2 text-sm">
          {rows.length} submission{rows.length === 1 ? '' : 's'}
          {unreadCount > 0 && ` · ${unreadCount} unread`}
        </p>
      </div>

      <EmailsView
        emails={rows}
        repliesByEmailId={repliesByEmailId}
        fromAddresses={replyFromAddresses()}
      />
    </>
  )
}
