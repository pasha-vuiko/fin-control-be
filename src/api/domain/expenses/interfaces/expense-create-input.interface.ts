import { Expense } from '@prisma-definitions/drizzle/schema';
import { InferInsertModel } from 'drizzle-orm';

type ExpenseInsertModel = InferInsertModel<typeof Expense>;

export interface ExpenseCreateInput extends Omit<
  ExpenseInsertModel,
  'id' | 'customerId' | 'createdAt' | 'updatedAt'
> {
  customerId: string;
}
