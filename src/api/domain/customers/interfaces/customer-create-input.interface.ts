import { Prisma } from '@prisma/client';

import CustomerCreateInput = Prisma.CustomerCreateInput;

export interface ICustomerCreateInput
  extends Omit<CustomerCreateInput, 'id' | 'auth0Id'> {
  userId: string;
}
