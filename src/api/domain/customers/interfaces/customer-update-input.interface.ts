import { ICustomerCreateInput } from '@api/domain/customers/interfaces/customer-create-input.interface';

export interface ICustomerUpdateInput
  extends Omit<Partial<ICustomerCreateInput>, 'auth0Id'> {}
