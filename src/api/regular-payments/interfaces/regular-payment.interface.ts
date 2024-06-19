import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';

export interface IRegularPayment {
  id: string;
  amount: number;
  customerId: string;
  dateOfCharge: Date;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date;
}
