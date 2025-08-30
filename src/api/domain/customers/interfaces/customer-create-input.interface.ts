import { Prisma } from '@prisma/client';

import CustomerCreateInputPrisma = Prisma.CustomerCreateInput;

export interface CustomerCreateInput
  extends Omit<CustomerCreateInputPrisma, 'id' | 'auth0Id'> {
  userId: string;
}
