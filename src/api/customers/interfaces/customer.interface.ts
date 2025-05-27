import { Customer } from '@prisma-definitions/client';

export interface ICustomer extends Omit<Customer, 'auth0Id'> {
  userId: string;
}
