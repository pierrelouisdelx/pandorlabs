/**
 * Creates (or updates) the admin account.
 *
 *   pnpm db:seed-admin
 *
 * Public sign-up is disabled in `lib/auth.ts`, so this is the only way an
 * account comes into existence. Re-running it resets the password of the
 * existing ADMIN_EMAIL account and re-asserts the admin role.
 */
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

// Env lives at the repo root. Load it before importing @pandorlabs/db, which
// reads DATABASE_URL at module scope.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

const { account, db, user } = await import('@pandorlabs/db')
const { and, eq } = await import('drizzle-orm')
// Same scrypt hasher Better Auth uses when no custom password config is set.
const { hashPassword } = await import('better-auth/crypto')

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Admin'

if (!email || !password) {
  throw new Error(
    'ADMIN_EMAIL and ADMIN_PASSWORD must be set — see .env.example',
  )
}
// Must match `emailAndPassword.minPasswordLength` in lib/auth.ts, otherwise the
// seeded password would be rejected at sign-in.
if (password.length < 8) {
  throw new Error('ADMIN_PASSWORD must be at least 8 characters')
}

const hash = await hashPassword(password)
const now = new Date()

const [existing] = await db
  .select({ id: user.id })
  .from(user)
  .where(eq(user.email, email))
  .limit(1)

if (existing) {
  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({ role: 'admin', name, updatedAt: now })
      .where(eq(user.id, existing.id))

    // The credential account row holds the password hash, separate from `user`.
    const [credential] = await tx
      .select({ id: account.id })
      .from(account)
      .where(
        and(
          eq(account.userId, existing.id),
          eq(account.providerId, 'credential'),
        ),
      )
      .limit(1)

    if (credential) {
      await tx
        .update(account)
        .set({ password: hash, updatedAt: now })
        .where(eq(account.id, credential.id))
    } else {
      await tx.insert(account).values({
        id: randomUUID(),
        accountId: existing.id,
        providerId: 'credential',
        userId: existing.id,
        password: hash,
        createdAt: now,
        updatedAt: now,
      })
    }
  })

  console.log(`Updated existing admin: ${email}`)
} else {
  const userId = randomUUID()

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name,
      email,
      emailVerified: true,
      role: 'admin',
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

  console.log(`Created admin: ${email}`)
}

process.exit(0)
