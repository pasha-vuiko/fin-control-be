import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';

export interface IExpense {
  id: string;
  customerId: string;
  date: Date;
  amount: number;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}
