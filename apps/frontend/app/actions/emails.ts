'use server'

import { db, emailReplies, emails, type NewEmailReply } from '@pandorlabs/db'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { replyFromAddresses } from '@/lib/env'
import { escapeHtml, resend } from '@/lib/resend'
import { requireAdmin } from '@/lib/session'

export type ReplyInput = {
  /** Which submission the reply is addressed to — chosen in the composer. */
  emailId: string
  /** Which verified Resend sender to send as — chosen in the composer. */
  fromAddress: string
  subject: string
  body: string
}

export type ActionResponse = {
  success: boolean
  message: string
}

export async function sendReply(input: ReplyInput): Promise<ActionResponse> {
  const session = await requireAdmin()

  const subject = input.subject?.trim() ?? ''
  const body = input.body?.trim() ?? ''

  if (!subject) return { success: false, message: 'Subject is required.' }
  if (!body) return { success: false, message: 'Message is required.' }

  // The FROM address arrives from the browser. Only addresses configured in
  // RESEND_FROM_ADDRESSES are allowed, so a tampered payload cannot make us
  // send as an arbitrary identity.
  if (!replyFromAddresses().includes(input.fromAddress)) {
    return { success: false, message: 'Unknown sender address.' }
  }

  const [target] = await db
    .select()
    .from(emails)
    .where(eq(emails.id, input.emailId))
    .limit(1)

  if (!target) {
    return { success: false, message: 'That submission no longer exists.' }
  }

  try {
    const { data, error } = await resend().emails.send({
      from: input.fromAddress,
      to: target.email,
      subject,
      text: body,
      html: `<p>${escapeHtml(body).replace(/\n/g, '<br />')}</p>`,
    })

    if (error) throw new Error(error.message)

    const reply: NewEmailReply = {
      emailId: target.id,
      sentByUserId: session.user.id,
      fromAddress: input.fromAddress,
      toAddress: target.email,
      subject,
      body,
      providerMessageId: data?.id ?? null,
    }

    await db.transaction(async (tx) => {
      await tx.insert(emailReplies).values(reply)
      await tx
        .update(emails)
        .set({ status: 'replied' })
        .where(eq(emails.id, target.id))
    })

    revalidatePath('/admin/emails')
    return { success: true, message: `Reply sent to ${target.email}.` }
  } catch (error) {
    console.error('Failed to send reply:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? `Could not send the reply: ${error.message}`
          : 'Could not send the reply.',
    }
  }
}

/** Flips `unread` to `read`. A replied submission keeps its status. */
export async function markAsRead(emailId: string): Promise<ActionResponse> {
  await requireAdmin()

  try {
    // Scoped to `unread` so re-opening an already-replied submission does not
    // downgrade its status back to read.
    await db
      .update(emails)
      .set({ status: 'read' })
      .where(and(eq(emails.id, emailId), eq(emails.status, 'unread')))

    revalidatePath('/admin/emails')
    return { success: true, message: 'Marked as read.' }
  } catch (error) {
    console.error('Failed to mark email as read:', error)
    return { success: false, message: 'Could not update the submission.' }
  }
}
