'use client'

import type { Email, EmailReply } from '@pandorlabs/db'
import { AlertTriangle, Check, CornerUpLeft, Mail } from 'lucide-react'
import { useState } from 'react'

import { markAsRead } from '@/app/actions/emails'
import { Button } from '@/components/ui/button'

import ReplyDialog from './reply-dialog'

type Props = {
  emails: Email[]
  repliesByEmailId: Record<string, EmailReply[]>
  fromAddresses: string[]
}

export default function EmailsView({
  emails,
  repliesByEmailId,
  fromAddresses,
}: Props) {
  // Which submission the composer opens on. The composer itself lets you switch
  // to any other submission before sending.
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null)

  if (emails.length === 0) {
    return (
      <div className="border-gray/20 rounded-2xl border border-dashed bg-white/5 px-6 py-16 text-center">
        <Mail className="text-gray mx-auto mb-4 size-8" />
        <p className="text-gray">No submissions yet.</p>
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-4">
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            replies={repliesByEmailId[email.id] ?? []}
            onReply={() => setReplyTargetId(email.id)}
          />
        ))}
      </ul>

      <ReplyDialog
        open={replyTargetId !== null}
        onOpenChange={(open) => setReplyTargetId(open ? replyTargetId : null)}
        emails={emails}
        initialEmailId={replyTargetId}
        fromAddresses={fromAddresses}
      />
    </>
  )
}

function EmailCard({
  email,
  replies,
  onReply,
}: {
  email: Email
  replies: EmailReply[]
  onReply: () => void
}) {
  const [markPending, setMarkPending] = useState(false)

  return (
    <li className="border-gray/20 rounded-2xl border bg-white/5 p-6 backdrop-blur-md">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{email.name}</h2>
            <StatusBadge status={email.status} />
          </div>

          <p className="text-gray mt-1 text-sm">
            <a
              href={`mailto:${email.email}`}
              className="hover:text-green-light transition"
            >
              {email.email}
            </a>
            {email.phone && ` · ${email.phone}`}
            {' · '}
            {formatDate(email.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {email.status === 'unread' && (
            <Button
              variant="secondary"
              size="sm"
              disabled={markPending}
              onClick={async () => {
                setMarkPending(true)
                await markAsRead(email.id)
                setMarkPending(false)
              }}
            >
              <Check className="size-4" />
              Mark read
            </Button>
          )}
          <Button size="sm" onClick={onReply}>
            <CornerUpLeft className="size-4" />
            Reply
          </Button>
        </div>
      </div>

      <p className="mt-4 text-sm whitespace-pre-wrap text-white/90">
        {email.message}
      </p>

      {email.forwardError && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-[#ffb86b]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Saved, but the forwarding email failed: {email.forwardError}
          </span>
        </p>
      )}

      {replies.length > 0 && (
        <div className="border-gray/20 mt-5 space-y-3 border-t pt-4">
          <h3 className="text-gray text-xs tracking-[2px] uppercase">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </h3>
          {replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <p className="text-gray text-xs">
                {formatDate(reply.createdAt)} · from {reply.fromAddress}
              </p>
              <p className="mt-1 font-medium text-white/90">{reply.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-white/70">
                {reply.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

function StatusBadge({ status }: { status: Email['status'] }) {
  const styles: Record<Email['status'], string> = {
    unread: 'bg-green-100/15 text-green-100',
    read: 'bg-white/10 text-white/70',
    replied: 'bg-green-light/15 text-green-light',
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs tracking-wider uppercase ${styles[status]}`}
    >
      {status}
    </span>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}
