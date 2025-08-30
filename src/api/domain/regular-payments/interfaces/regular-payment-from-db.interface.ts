import { ExpenseCategory } from '@prisma/client';

export interface IRegularPaymentFromDb {
  id: string;
  customerId: string;
  amount: number;
  category: ExpenseCategory;
  dateOfCharge: Date;
  createdAt: Date;
  updatedAt: Date;
}
