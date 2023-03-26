import { Customer } from '../../../../prisma/client';

export interface ICustomer extends Omit<Customer, 'auth0Id'> {
  userId: string;
}
