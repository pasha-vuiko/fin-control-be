import { Prisma } from '@prisma-definitions/client/client';

import ExpenseCreateInput = Prisma.ExpenseCreateInput;

export interface IExpenseCreateInput
  extends Omit<ExpenseCreateInput, 'id' | 'customer' | 'createdAt' | 'updatedAt'> {
  customerId: string;
}
