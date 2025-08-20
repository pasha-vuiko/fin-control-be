import { Expense } from '@prisma/client';

export interface IExpense extends Omit<Expense, 'amount'> {
  amount: number;
}
