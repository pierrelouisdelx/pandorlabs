'use server'

import { APIError } from 'better-auth/api'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { requireUser } from '@/lib/session'

export type ActionResponse = {
  success: boolean
  message: string
}

/**
 * Updates the signed-in user's profile.
 *
 * Better Auth resolves *which* user from the session cookie, never from the
 * payload — so this cannot be pointed at somebody else's account.
 */
export async function updateProfile(name: string): Promise<ActionResponse> {
  await requireUser()

  const trimmed = name?.trim() ?? ''
  if (!trimmed) {
    return { success: false, message: 'Name is required.' }
  }
  if (trimmed.length > 100) {
    return { success: false, message: 'Name is too long.' }
  }

  try {
    await auth.api.updateUser({
      body: { name: trimmed },
      headers: await headers(),
    })

    revalidatePath('/dashboard/account')
    return { success: true, message: 'Profile updated.' }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, message: toMessage(error, 'update your profile') }
  }
}

/**
 * Changes the signed-in user's password.
 *
 * The current password is required — Better Auth verifies it, so a stolen
 * session cookie alone cannot lock the owner out of their account. Other
 * sessions are revoked, which is also what makes that stolen cookie useless.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResponse> {
  await requireUser()

  if (!currentPassword) {
    return { success: false, message: 'Enter your current password.' }
  }
  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      message: 'New password must be at least 8 characters.',
    }
  }
  if (currentPassword === newPassword) {
    return { success: false, message: 'That is already your password.' }
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    })

    return { success: true, message: 'Password changed.' }
  } catch (error) {
    console.error('Failed to change password:', error)
    return { success: false, message: toMessage(error, 'change your password') }
  }
}

/** Better Auth reports "wrong password" and friends as an APIError. */
function toMessage(error: unknown, action: string): string {
  if (error instanceof APIError) {
    return error.body?.message ?? `Could not ${action}.`
  }
  return `Could not ${action}.`
}
