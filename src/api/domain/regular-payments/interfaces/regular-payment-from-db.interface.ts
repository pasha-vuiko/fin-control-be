import { ExpenseCategory } from '@prisma/client';

export interface RegularPaymentFromDb {
  id: string;
  customerId: string;
  amount: number;
  category: ExpenseCategory;
  dateOfCharge: Date;
  createdAt: Date;
  updatedAt: Date;
}
