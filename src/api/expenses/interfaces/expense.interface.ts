import { Expense } from '@prisma-definitions/client';

export interface IExpense extends Omit<Expense, 'amount'> {
  amount: number;
}
