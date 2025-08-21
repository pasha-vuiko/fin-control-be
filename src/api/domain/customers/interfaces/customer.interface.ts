import { Customer } from '@prisma-definitions/client/client';

export interface ICustomer extends Omit<Customer, 'auth0Id'> {
  userId: string;
}
