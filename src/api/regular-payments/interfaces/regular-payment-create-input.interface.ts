import { Prisma } from '@prisma-definitions/client';

import RegularPaymentCreateInput = Prisma.RegularPaymentCreateInput;

export interface IRegularPaymentCreateInput
  extends Omit<RegularPaymentCreateInput, 'id' | 'customer'> {
  customerId: string;
}
