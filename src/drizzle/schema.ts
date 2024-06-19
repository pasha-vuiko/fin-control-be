import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

export const ExpenseCategory = pgEnum('ExpenseCategory', [
  'FOOD',
  'CLOTHES',
  'SUBSCRIPTIONS',
  'OTHER',
  'MEDICINE',
  'UTILITY_PAYMENTS',
  'ANIMALS',
  'PLACES_TO_EAT',
  'EDUCATION',
  'BOOKS',
  'TAXI',
  'GIFTS',
  'DONATIONS',
  'MOBILE_SERVICES',
  'SPORTS',
  'ENTERTAINMENT',
  'BEAUTY_AND_CARE',
  'HOUSEHOLD',
  'PUBLIC_TRANSPORT',
  'TRAVEL',
]);
export const Sex = pgEnum('Sex', ['MALE', 'FEMALE']);

export const _prisma_migrations = pgTable('_prisma_migrations', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  finished_at: timestamp('finished_at', { withTimezone: true, mode: 'string' }),
  migration_name: varchar('migration_name', { length: 255 }).notNull(),
  logs: text('logs'),
  rolled_back_at: timestamp('rolled_back_at', { withTimezone: true, mode: 'string' }),
  started_at: timestamp('started_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  applied_steps_count: integer('applied_steps_count').default(0).notNull(),
});

export const Customer = pgTable(
  'Customer',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('userId').notNull(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    birthdate: timestamp('birthdate', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    sex: Sex('sex').notNull(),
    createdAt: timestamp('createdAt', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  () => {
    return {
      email_key: uniqueIndex('Customer_email_key'),
      phone_key: uniqueIndex('Customer_phone_key'),
      userId_key: uniqueIndex('Customer_userId_key'),
    };
  },
);

export const RegularPayment = pgTable('RegularPayment', {
  id: text('id').primaryKey().notNull(),
  customerId: text('customerId')
    .notNull()
    .references(() => Customer.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt', { precision: 6, withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 6, withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  category: ExpenseCategory('category').notNull(),
  dateOfCharge: timestamp('dateOfCharge', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).notNull(),
});

export const Expense = pgTable('Expense', {
  id: text('id').primaryKey().notNull(),
  customerId: text('customerId')
    .notNull()
    .references(() => Customer.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date', { precision: 6, withTimezone: true, mode: 'string' }).notNull(),
  category: ExpenseCategory('category').notNull(),
  createdAt: timestamp('createdAt', { precision: 6, withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { precision: 6, withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

// Relations
export const RegularPaymentRelations = relations(RegularPayment, ({ one }) => ({
  Customer: one(Customer, {
    fields: [RegularPayment.customerId],
    references: [Customer.id],
  }),
}));

export const CustomerRelations = relations(Customer, ({ many }) => ({
  RegularPayments: many(RegularPayment),
  Expenses: many(Expense),
}));

export const ExpenseRelations = relations(Expense, ({ one }) => ({
  Customer: one(Customer, {
    fields: [Expense.customerId],
    references: [Customer.id],
  }),
}));
