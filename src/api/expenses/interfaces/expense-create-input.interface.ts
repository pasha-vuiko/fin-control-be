import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';

export interface IExpenseCreateInput {
  customerId: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
}
