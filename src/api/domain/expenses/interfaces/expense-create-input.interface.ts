import { InferInsertModel } from 'drizzle-orm';

import { Expense } from '../../../../../prisma/drizzle/schema';

type ExpenseInsertModel = InferInsertModel<typeof Expense>;

export interface ExpenseCreateInput
  extends Omit<ExpenseInsertModel, 'id' | 'customerId' | 'createdAt' | 'updatedAt'> {
  customerId: string;
}
