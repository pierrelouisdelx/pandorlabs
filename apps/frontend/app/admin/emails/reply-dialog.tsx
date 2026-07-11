'use client'

import type { Email } from '@pandorlabs/db'
import { Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { sendReply } from '@/app/actions/emails'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  emails: Email[]
  /** Submission the composer opens on — still switchable in the dropdown. */
  initialEmailId: string | null
  fromAddresses: string[]
}

const SELECT_CLASS =
  'border-gray/20 focus:border-green-light/50 w-full rounded-full border bg-white/5 px-6 py-3 text-base text-white backdrop-blur-md transition focus-visible:outline-hidden'

export default function ReplyDialog({
  open,
  onOpenChange,
  emails,
  initialEmailId,
  fromAddresses,
}: Props) {
  const [emailId, setEmailId] = useState(initialEmailId ?? '')
  const [fromAddress, setFromAddress] = useState(fromAddresses[0] ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)

  const target = emails.find((email) => email.id === emailId) ?? null

  // Re-seed the form each time the dialog is opened from a row, so a half-typed
  // draft from a previous target never leaks into the next reply.
  useEffect(() => {
    if (!open || !initialEmailId) return

    const opened = emails.find((email) => email.id === initialEmailId)
    setEmailId(initialEmailId)
    setFromAddress(fromAddresses[0] ?? '')
    setSubject(opened ? `Re: your message to PandorLabs` : '')
    setBody(opened ? `Hi ${opened.name.split(' ')[0]},\n\n` : '')
  }, [open, initialEmailId, emails, fromAddresses])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    try {
      const result = await sendReply({ emailId, fromAddress, subject, body })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      onOpenChange(false)
    } catch {
      toast.error('Could not send the reply. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray/20 bg-primary max-w-2xl rounded-2xl border p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Send a reply
          </DialogTitle>
          <DialogDescription className="text-gray text-sm">
            Sent through Resend. Pick the submission to answer and the sender
            identity to answer from.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reply-target" className="text-sm text-white/80">
              Replying to
            </label>
            <select
              id="reply-target"
              className={SELECT_CLASS}
              value={emailId}
              onChange={(event) => setEmailId(event.target.value)}
              required
            >
              {emails.map((email) => (
                <option
                  key={email.id}
                  value={email.id}
                  className="bg-primary text-white"
                >
                  {email.name} — {email.email}
                </option>
              ))}
            </select>
            {target && (
              <p className="text-gray px-6 text-xs">Goes to {target.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="reply-from" className="text-sm text-white/80">
              From
            </label>
            <select
              id="reply-from"
              className={SELECT_CLASS}
              value={fromAddress}
              onChange={(event) => setFromAddress(event.target.value)}
              required
            >
              {fromAddresses.map((address) => (
                <option
                  key={address}
                  value={address}
                  className="bg-primary text-white"
                >
                  {address}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="reply-subject" className="text-sm text-white/80">
              Subject
            </label>
            <Input
              id="reply-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Re: your message to PandorLabs"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reply-body" className="text-sm text-white/80">
              Message
            </label>
            <Textarea
              id="reply-body"
              rows={8}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your reply…"
              required
            />
          </div>

          {target && (
            <details className="border-gray/20 rounded-2xl border bg-white/5 px-4 py-3">
              <summary className="text-gray cursor-pointer text-sm">
                Original message from {target.name}
              </summary>
              <p className="mt-3 text-sm whitespace-pre-wrap text-white/80">
                {target.message}
              </p>
            </details>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !emailId}>
              {pending ? 'Sending…' : 'Send reply'}
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
