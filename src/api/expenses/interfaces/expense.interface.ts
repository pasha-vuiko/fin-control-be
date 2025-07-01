import { Expense } from '@prisma-definitions/client/client';

export interface IExpense extends Omit<Expense, 'amount'> {
  amount: number;
}
