import { RegularPayment } from '@prisma/client';

export interface IRegularPayment extends Omit<RegularPayment, 'amount'> {
  amount: number;
}
