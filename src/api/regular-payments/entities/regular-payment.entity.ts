import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';

import { ExpenseCategory } from '../../../../prisma/client';

export class RegularPaymentEntity implements Omit<IRegularPayment, 'amount'> {
  id: string;
  customerId: string;
  amount: number;
  category: ExpenseCategory; // TODO Replace with self implemented enum
  dateOfCharge: Date;
  createdAt: Date;
  updatedAt: Date;
}
