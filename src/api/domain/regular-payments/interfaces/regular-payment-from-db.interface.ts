import { ExpenseCategory } from '@prisma-definitions/client/client';

export interface IRegularPayment {
  id: string;
  customerId: string;
  amount: number;
  category: ExpenseCategory;
  dateOfCharge: Date;
  createdAt: Date;
  updatedAt: Date;
}
