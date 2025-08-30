import { ExpenseCategory } from '@prisma/client';

export interface IExpenseFromDb {
  id: string;
  customerId: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}
