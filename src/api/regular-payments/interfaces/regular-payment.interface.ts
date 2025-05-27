import { RegularPayment } from '@prisma-definitions/client';

export interface IRegularPayment extends Omit<RegularPayment, 'amount'> {
  amount: number;
}
