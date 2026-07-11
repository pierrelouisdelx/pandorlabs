import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

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
  ]
)

export type Waitlist = typeof waitlist.$inferSelect
export type NewWaitlist = typeof waitlist.$inferInsert
