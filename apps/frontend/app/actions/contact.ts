'use server'

import { db, emails, type NewEmail } from '@pandorlabs/db'
import { eq } from 'drizzle-orm'

import { serverEnv } from '@/lib/env'
import { escapeHtml, resend } from '@/lib/resend'

export type ContactFormData = {
  name: string
  email: string
  phone?: string
  message: string
}

export type ContactResponse = {
  success: boolean
  message: string
  fieldErrors?: Partial<Record<keyof ContactFormData, string>>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE_LENGTH = 5000

function validate(data: ContactFormData) {
  const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {}

  const name = data.name?.trim() ?? ''
  const email = data.email?.trim().toLowerCase() ?? ''
  const phone = data.phone?.trim() ?? ''
  const message = data.message?.trim() ?? ''

  if (!name) fieldErrors.name = 'Please tell us your name.'
  if (!email) fieldErrors.email = 'Please enter your email address.'
  else if (!EMAIL_REGEX.test(email))
    fieldErrors.email = 'Please enter a valid email address.'
  if (!message) fieldErrors.message = 'Please write a message.'
  else if (message.length > MAX_MESSAGE_LENGTH)
    fieldErrors.message = `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`

  return {
    fieldErrors,
    values: { name, email, phone: phone || null, message },
  }
}

/**
 * Persist a contact-form submission, then forward it.
 *
 * The DB write happens first and deliberately gates the response: if Resend is
 * down we still have the message and the admin can read it at /dashboard/emails,
 * so
 * the visitor is told it went through. The forward failure is recorded on the
 * row instead of being thrown away.
 */
export async function submitContactForm(
  formData: ContactFormData,
): Promise<ContactResponse> {
  const { fieldErrors, values } = validate(formData)

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fieldErrors,
    }
  }

  let emailId: string
  try {
    const insertData: NewEmail = values
    const [row] = await db
      .insert(emails)
      .values(insertData)
      .returning({ id: emails.id })
    emailId = row.id
  } catch (error) {
    console.error('Failed to save contact submission:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    }
  }

  try {
    const { data, error } = await resend().emails.send({
      from: serverEnv.contactFromEmail,
      to: serverEnv.contactForwardEmail,
      // Replying straight from the inbox reaches the visitor, not us.
      replyTo: values.email,
      subject: `New contact form submission from ${values.name}`,
      text: [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Phone: ${values.phone ?? '—'}`,
        '',
        values.message,
      ].join('\n'),
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(values.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(values.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(values.phone ?? '—')}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(values.message).replace(/\n/g, '<br />')}</p>
      `,
    })

    if (error) throw new Error(error.message)

    await db
      .update(emails)
      .set({ forwardedAt: new Date(), forwardError: null })
      .where(eq(emails.id, emailId))

    void data
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    console.error('Failed to forward contact submission:', reason)

    await db
      .update(emails)
      .set({ forwardError: reason })
      .where(eq(emails.id, emailId))
      .catch(() => {
        // Nothing more we can do; the submission is already saved.
      })
  }

  return {
    success: true,
    message: "Thanks for reaching out! We'll get back to you within 24 hours.",
  }
}
