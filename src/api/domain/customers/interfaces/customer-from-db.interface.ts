import { Customer } from '@prisma-definitions/client/client';

export interface CustomerFromDb extends Omit<Customer, 'auth0Id'> {
  userId: string;
}
