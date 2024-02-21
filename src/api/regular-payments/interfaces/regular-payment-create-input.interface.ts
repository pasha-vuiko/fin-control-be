import { Prisma } from '@prisma/client';

import RegularPaymentCreateInput = Prisma.RegularPaymentCreateInput;

export interface IRegularPaymentCreateInput
  extends Omit<RegularPaymentCreateInput, 'id' | 'customer'> {
  customerId: string;
}
