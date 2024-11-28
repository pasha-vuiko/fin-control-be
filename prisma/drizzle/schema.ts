import { relations, sql } from 'drizzle-orm';
import {
  decimal,
  foreignKey,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const Sex = pgEnum('Sex', ['MALE', 'FEMALE']);

export const ExpenseCategory = pgEnum('ExpenseCategory', [
  'FOOD',
  'MEDICINE',
  'CLOTHES',
  'UTILITY_PAYMENTS',
  'ANIMALS',
  'PLACES_TO_EAT',
  'EDUCATION',
  'BOOKS',
  'TAXI',
  'GIFTS',
  'DONATIONS',
  'MOBILE_SERVICES',
  'SUBSCRIPTIONS',
  'SPORTS',
  'ENTERTAINMENT',
  'BEAUTY_AND_CARE',
  'HOUSEHOLD',
  'PUBLIC_TRANSPORT',
  'TRAVEL',
  'OTHER',
]);

export const Customer = pgTable('Customer', {
  id: text('id')
    .notNull()
    .primaryKey()
    .default(sql`uuid(4)`),
  userId: text('userId').notNull().unique(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').unique(),
  birthdate: timestamp('birthdate', { precision: 6, withTimezone: true }).notNull(),
  sex: Sex('sex').notNull(),
  createdAt: timestamp('createdAt', { precision: 6, withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updatedAt', { precision: 6, withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const Expense = pgTable(
  'Expense',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .default(sql`uuid(4)`),
    customerId: text('customerId').notNull(),
    amount: decimal('amount', { precision: 65, scale: 30 }).notNull(),
    date: timestamp('date', { precision: 6, withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { precision: 6, withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 6, withTimezone: true })
      .notNull()
      .defaultNow(),
    category: ExpenseCategory('category').notNull(),
  },
  Expense => ({
    Expense_customer_fkey: foreignKey({
      name: 'Expense_customer_fkey',
      columns: [Expense.customerId],
      foreignColumns: [Customer.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  }),
);

export const RegularPayment = pgTable(
  'RegularPayment',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .default(sql`uuid(4)`),
    customerId: text('customerId').notNull(),
    amount: decimal('amount', { precision: 65, scale: 30 }).notNull(),
    dateOfCharge: timestamp('dateOfCharge', {
      precision: 6,
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp('createdAt', { precision: 6, withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updatedAt', { precision: 6, withTimezone: true })
      .notNull()
      .defaultNow(),
    category: ExpenseCategory('category').notNull(),
  },
  RegularPayment => ({
    RegularPayment_customer_fkey: foreignKey({
      name: 'RegularPayment_customer_fkey',
      columns: [RegularPayment.customerId],
      foreignColumns: [Customer.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  }),
);

export const CustomerRelations = relations(Customer, ({ many }) => ({
  expense: many(Expense, {
    relationName: 'CustomerToExpense',
  }),
  regularPayment: many(RegularPayment, {
    relationName: 'CustomerToRegularPayment',
  }),
}));

export const ExpenseRelations = relations(Expense, ({ one }) => ({
  customer: one(Customer, {
    relationName: 'CustomerToExpense',
    fields: [Expense.customerId],
    references: [Customer.id],
  }),
}));

export const RegularPaymentRelations = relations(RegularPayment, ({ one }) => ({
  customer: one(Customer, {
    relationName: 'CustomerToRegularPayment',
    fields: [RegularPayment.customerId],
    references: [Customer.id],
  }),
}));
