import { Prisma } from '@prisma-definitions/client/client';

import CustomerCreateInputPrisma = Prisma.CustomerCreateInput;

export interface CustomerCreateInput
  extends Omit<CustomerCreateInputPrisma, 'id' | 'auth0Id'> {
  userId: string;
}
