import { db, inboundEmails, type NewInboundEmail } from '@pandorlabs/db'
import { NextResponse } from 'next/server'

import { serverEnv } from '@/lib/env'
import { escapeHtml, resend } from '@/lib/resend'
import { parseAddress, verifySvixSignature } from '@/lib/resend-webhook'

// This route verifies an HMAC signature over the raw body, so it must run on
// the Node runtime and never be statically cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** The inbound `data` payload we care about. Fields are validated at use. */
type ResendInboundData = {
  from?: string
  to?: string | string[]
  subject?: string
  text?: string
  html?: string
  email_id?: string
  message_id?: string
}

type ResendWebhookEvent = {
  type?: string
  created_at?: string
  data?: ResendInboundData
}

export async function POST(request: Request): Promise<Response> {
  // Read the exact bytes: the signature is computed over the raw body, so
  // parsing first and re-serializing would break verification.
  const body = await request.text()

  const verified = verifySvixSignature(serverEnv.resendWebhookSecret, body, {
    id: request.headers.get('svix-id'),
    timestamp: request.headers.get('svix-timestamp'),
    signature: request.headers.get('svix-signature'),
  })

  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: ResendWebhookEvent
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 })
  }

  // We only subscribe to inbound receipts, but stay lenient about the exact
  // event name across Resend versions. Acknowledge anything else with 200 so
  // Resend does not retry an event we deliberately ignore.
  const isInbound =
    event.type === 'email.received' || event.type === 'inbound.email.received'
  if (!isInbound) {
    return NextResponse.json({ ignored: event.type ?? 'unknown' })
  }

  const data = event.data
  if (!data?.from) {
    return NextResponse.json({ error: 'Missing sender' }, { status: 400 })
  }

  const { name: fromName, email: fromAddress } = parseAddress(data.from)
  const toAddress = Array.isArray(data.to) ? (data.to[0] ?? '') : (data.to ?? '')

  // A provider id is required as the idempotency key. Fall back to the Svix
  // message id so a payload without one still de-duplicates on retry.
  const providerMessageId =
    data.email_id ??
    data.message_id ??
    request.headers.get('svix-id') ??
    null
  if (!providerMessageId) {
    return NextResponse.json({ error: 'Missing message id' }, { status: 400 })
  }

  const row: NewInboundEmail = {
    providerMessageId,
    fromAddress,
    fromName,
    toAddress,
    subject: data.subject ?? null,
    text: data.text ?? null,
    html: data.html ?? null,
    receivedAt: event.created_at ? new Date(event.created_at) : null,
  }

  let stored: { id: string } | undefined
  try {
    // Resend re-delivers on any non-2xx, and Svix can deliver twice on its own.
    // The unique `providerMessageId` makes the insert idempotent.
    const [inserted] = await db
      .insert(inboundEmails)
      .values(row)
      .onConflictDoNothing({ target: inboundEmails.providerMessageId })
      .returning({ id: inboundEmails.id })
    stored = inserted
  } catch (error) {
    console.error('Failed to store inbound email:', error)
    // 500 tells Resend to retry — the message is not lost.
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 })
  }

  // No row means this was a duplicate delivery: it has already been forwarded.
  if (stored) {
    await forward(row)
  }

  return NextResponse.json({ received: true })
}

/**
 * Relay a stored inbound email on to the forwarding mailbox.
 *
 * Failures are logged rather than surfaced: the message is already persisted
 * and readable at /dashboard/emails, and a non-2xx here would only earn a
 * retry that the idempotency check above would decline to forward anyway.
 */
async function forward(row: NewInboundEmail): Promise<void> {
  const sender = row.fromName
    ? `${row.fromName} <${row.fromAddress}>`
    : row.fromAddress
  const subject = row.subject ?? '(no subject)'

  try {
    const { error } = await resend().emails.send({
      from: serverEnv.contactFromEmail,
      to: serverEnv.inboundForwardEmail,
      // Replying from the forwarding inbox reaches the original sender.
      replyTo: row.fromAddress,
      subject: `Fwd: ${subject}`,
      text: [
        `From: ${sender}`,
        `To: ${row.toAddress}`,
        `Subject: ${subject}`,
        '',
        row.text ?? '(no plain-text body)',
      ].join('\n'),
      html: [
        `<p><strong>From:</strong> ${escapeHtml(sender)}<br />`,
        `<strong>To:</strong> ${escapeHtml(row.toAddress)}<br />`,
        `<strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
        '<hr />',
        // The original HTML is passed through as-is: it is the message itself,
        // and escaping it would show markup instead of rendering the email.
        row.html ??
          `<p>${escapeHtml(row.text ?? '(no body)').replace(/\n/g, '<br />')}</p>`,
      ].join('\n'),
    })

    if (error) throw new Error(error.message)
  } catch (error) {
    console.error('Failed to forward inbound email:', error)
  }
}
