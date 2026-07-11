import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const waitlist = pgTable(
  'waitlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    company: text('company').notNull(),
    message: text('message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_waitlist_email').on(table.email),
    index('idx_waitlist_created_at').on(table.createdAt.desc()),
  ],
)

export type Waitlist = typeof waitlist.$inferSelect
export type NewWaitlist = typeof waitlist.$inferInsert

/* -------------------------------------------------------------------------- */
/*                                    Auth                                     */
/* -------------------------------------------------------------------------- */

export const USER_ROLES = ['admin', 'user'] as const
export type UserRole = (typeof USER_ROLES)[number]

// Better Auth owns the shape of these four tables. The export keys must stay
// singular (`user`, not `users`) — the drizzle adapter looks tables up by the
// model name it uses internally.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  // Declared to Better Auth as an additional field with `input: false`, so a
  // sign-up payload can never set it — only the seed script and SQL can.
  role: text('role').$type<UserRole>().default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_session_user_id').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_account_user_id').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_verification_identifier').on(table.identifier)],
)

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
export type Session = typeof session.$inferSelect
export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert

/* -------------------------------------------------------------------------- */
/*                              Contact form email                             */
/* -------------------------------------------------------------------------- */

export const EMAIL_STATUSES = ['unread', 'read', 'replied'] as const
export type EmailStatus = (typeof EMAIL_STATUSES)[number]

// One row per contact-form submission. The row is written before the Resend
// forward is attempted, so a Resend outage costs us a notification, never the
// message itself — `forwardError` records what went wrong.
export const emails = pgTable(
  'emails',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    message: text('message').notNull(),
    status: text('status').$type<EmailStatus>().default('unread').notNull(),
    forwardedAt: timestamp('forwarded_at', { withTimezone: true }),
    forwardError: text('forward_error'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_emails_created_at').on(table.createdAt.desc()),
    index('idx_emails_status').on(table.status),
  ],
)

// One row per reply sent from the admin panel, kept as an audit trail of who
// replied to what, from which sender identity.
export const emailReplies = pgTable(
  'email_replies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    emailId: uuid('email_id')
      .notNull()
      .references(() => emails.id, { onDelete: 'cascade' }),
    // Null when the replying admin is later deleted — the reply itself stays.
    sentByUserId: text('sent_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    fromAddress: text('from_address').notNull(),
    toAddress: text('to_address').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    providerMessageId: text('provider_message_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_email_replies_email_id').on(table.emailId),
    index('idx_email_replies_created_at').on(table.createdAt.desc()),
  ],
)

export type Email = typeof emails.$inferSelect
export type NewEmail = typeof emails.$inferInsert
export type EmailReply = typeof emailReplies.$inferSelect
export type NewEmailReply = typeof emailReplies.$inferInsert
