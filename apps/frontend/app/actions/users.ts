'use server'

import { randomUUID } from 'node:crypto'

import { account, db, session, user, USER_ROLES } from '@pandorlabs/db'
import type { UserRole } from '@pandorlabs/db'
// Same scrypt hasher Better Auth uses when no custom password config is set, so
// a password set here verifies at sign-in exactly like a normal one.
import { hashPassword } from 'better-auth/crypto'
import { and, count, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/session'

export type ActionResponse = {
  success: boolean
  message: string
}

const MIN_PASSWORD_LENGTH = 8

/**
 * Creates a new account.
 *
 * Public sign-up is disabled in `lib/auth.ts`, so this admin action is the only
 * in-app way to add a user besides the seed script. Mirrors what the seed does:
 * a `user` row plus a `credential` account row that holds the password hash.
 */
export async function createUser(input: {
  name: string
  email: string
  password: string
  role: UserRole
}): Promise<ActionResponse> {
  await requireAdmin()

  const name = input.name?.trim() ?? ''
  const email = input.email?.trim().toLowerCase() ?? ''
  const password = input.password ?? ''
  const role = input.role

  if (!name) return { success: false, message: 'Name is required.' }
  if (!email || !email.includes('@')) {
    return { success: false, message: 'A valid email is required.' }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }
  if (!USER_ROLES.includes(role)) {
    return { success: false, message: 'Invalid role.' }
  }

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (existing) {
    return { success: false, message: 'A user with that email already exists.' }
  }

  try {
    const userId = randomUUID()
    const hash = await hashPassword(password)
    const now = new Date()

    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        name,
        email,
        emailVerified: true,
        role,
        createdAt: now,
        updatedAt: now,
      })
      await tx.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: 'credential',
        userId,
        password: hash,
        createdAt: now,
        updatedAt: now,
      })
    })

    revalidatePath('/dashboard/users')
    return { success: true, message: `Created ${email}.` }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, message: 'Could not create the user.' }
  }
}

/**
 * Resets a user's password to one the admin chooses, then revokes every session
 * that user holds so the old credentials stop working immediately.
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string,
): Promise<ActionResponse> {
  await requireAdmin()

  if (!userId) return { success: false, message: 'Missing user.' }
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }

  const [target] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!target) return { success: false, message: 'User not found.' }

  try {
    const hash = await hashPassword(newPassword)
    const now = new Date()

    await db.transaction(async (tx) => {
      // The password hash lives on the credential account row, not on `user`.
      const [credential] = await tx
        .select({ id: account.id })
        .from(account)
        .where(
          and(eq(account.userId, userId), eq(account.providerId, 'credential')),
        )
        .limit(1)

      if (credential) {
        await tx
          .update(account)
          .set({ password: hash, updatedAt: now })
          .where(eq(account.id, credential.id))
      } else {
        // A user seeded without a credential row (unusual) still gets one.
        await tx.insert(account).values({
          id: randomUUID(),
          accountId: userId,
          providerId: 'credential',
          userId,
          password: hash,
          createdAt: now,
          updatedAt: now,
        })
      }

      // Force a fresh sign-in with the new password everywhere.
      await tx.delete(session).where(eq(session.userId, userId))
    })

    return { success: true, message: 'Password reset. Their sessions were signed out.' }
  } catch (error) {
    console.error('Failed to reset password:', error)
    return { success: false, message: 'Could not reset the password.' }
  }
}

/**
 * Changes a user's role. Guards against removing the last admin, which would
 * lock everyone out of the admin area.
 */
export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<ActionResponse> {
  const session = await requireAdmin()

  if (!USER_ROLES.includes(role)) {
    return { success: false, message: 'Invalid role.' }
  }

  const [target] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!target) return { success: false, message: 'User not found.' }
  if (target.role === role) {
    return { success: false, message: `Already ${role}.` }
  }

  if (target.role === 'admin' && role !== 'admin') {
    const [{ value: adminCount }] = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.role, 'admin'))

    if (adminCount <= 1) {
      return {
        success: false,
        message: 'Cannot demote the last admin.',
      }
    }
    if (userId === session.user.id) {
      return { success: false, message: 'You cannot demote yourself.' }
    }
  }

  try {
    await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, userId))

    revalidatePath('/dashboard/users')
    return { success: true, message: `Role set to ${role}.` }
  } catch (error) {
    console.error('Failed to set role:', error)
    return { success: false, message: 'Could not change the role.' }
  }
}

/**
 * Deletes a user. The `session` and `account` rows cascade on the foreign key,
 * so this also revokes their access. An admin cannot delete themselves or the
 * last remaining admin.
 */
export async function deleteUser(userId: string): Promise<ActionResponse> {
  const session = await requireAdmin()

  if (!userId) return { success: false, message: 'Missing user.' }
  if (userId === session.user.id) {
    return { success: false, message: 'You cannot delete your own account.' }
  }

  const [target] = await db
    .select({ id: user.id, email: user.email, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!target) return { success: false, message: 'User not found.' }

  if (target.role === 'admin') {
    const [{ value: otherAdmins }] = await db
      .select({ value: count() })
      .from(user)
      .where(and(eq(user.role, 'admin'), ne(user.id, userId)))

    if (otherAdmins === 0) {
      return { success: false, message: 'Cannot delete the last admin.' }
    }
  }

  try {
    await db.delete(user).where(eq(user.id, userId))

    revalidatePath('/dashboard/users')
    return { success: true, message: `Deleted ${target.email}.` }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return { success: false, message: 'Could not delete the user.' }
  }
}
