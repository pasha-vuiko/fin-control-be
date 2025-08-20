import { InferInsertModel } from 'drizzle-orm';

import { Expense } from '../../../../../prisma/drizzle/schema';

type ExpenseCreateInput = InferInsertModel<typeof Expense>;

export interface IExpenseCreateInput
  extends Omit<ExpenseCreateInput, 'id' | 'customerId' | 'createdAt' | 'updatedAt'> {
  customerId: string;
}
