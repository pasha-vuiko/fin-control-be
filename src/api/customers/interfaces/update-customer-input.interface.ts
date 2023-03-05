import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';

export interface IUpdateCustomerInput
  extends Omit<Partial<ICreateCustomerInput>, 'auth0Id'> {}
