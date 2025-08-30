import { Expense } from '@prisma-definitions/client/client';

export interface ExpenseFromDb extends Omit<Expense, 'amount'> {
  amount: number;
}
