import { RegularPayment } from '@prisma-definitions/client/client';

export interface IRegularPayment extends Omit<RegularPayment, 'amount'> {
  amount: number;
}
