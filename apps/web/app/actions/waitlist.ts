'use server'

import { db, waitlist, type NewWaitlist } from '@pandorlabs/db'

export type WaitlistFormData = {
  name: string
  email: string
  company: string
  message?: string
}

export type WaitlistResponse = {
  success: boolean
  message: string
  isDuplicate?: boolean
}

// Postgres unique_violation, raised by the unique index on waitlist.email.
// Drizzle wraps driver errors in a DrizzleQueryError, so the PostgresError
// carrying the code sits on `cause` rather than on the thrown error itself.
const UNIQUE_VIOLATION = '23505'

function isUniqueViolation(error: unknown): boolean {
  for (let err: unknown = error; err != null; err = (err as { cause?: unknown }).cause) {
    if (
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: unknown }).code === UNIQUE_VIOLATION
    ) {
      return true
    }
  }
  return false
}

export async function joinWaitlist(
  formData: WaitlistFormData
): Promise<WaitlistResponse> {
  try {
    // Validate input
    if (!formData.name || !formData.email || !formData.company) {
      return {
        success: false,
        message: 'Please fill in all required fields.',
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      }
    }

    const insertData: NewWaitlist = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      company: formData.company.trim(),
      message: formData.message?.trim() || null,
    }

    await db.insert(waitlist).values(insertData)

    return {
      success: true,
      message: "Thanks for joining! We'll reach out to you soon.",
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "You're already on our waitlist!",
        isDuplicate: true,
      }
    }

    console.error('Failed to join waitlist:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    }
  }
}
