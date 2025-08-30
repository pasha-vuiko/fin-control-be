import { ExpenseCategory } from '@prisma/client';

export interface ExpenseFromDb {
  id: string;
  customerId: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}
