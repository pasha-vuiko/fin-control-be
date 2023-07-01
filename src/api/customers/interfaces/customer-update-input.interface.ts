import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';

export interface ICustomerUpdateInput
  extends Omit<Partial<ICustomerCreateInput>, 'auth0Id'> {}
