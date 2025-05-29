import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, r => ({
  Customer: {
    expense: r.many.Expense({
      alias: 'CustomerToExpense',
    }),
    regularPayment: r.many.RegularPayment({
      alias: 'CustomerToRegularPayment',
    }),
  },
  Expense: {
    customer: r.one.Customer({
      from: r.Expense.customerId,
      to: r.Customer.id,
      alias: 'CustomerToExpense',
    }),
  },
  RegularPayment: {
    customer: r.one.Customer({
      from: r.RegularPayment.customerId,
      to: r.Customer.id,
      alias: 'CustomerToRegularPayment',
    }),
  },
}));
