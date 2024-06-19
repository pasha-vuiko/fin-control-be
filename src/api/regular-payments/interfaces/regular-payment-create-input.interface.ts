import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';

export interface IRegularPaymentCreateInput {
  customerId: string;
  amount: number;
  category: ExpenseCategory;
  dateOfCharge: string;
}
