import { CustomerCreateInput } from '@api/domain/customers/interfaces/customer-create-input.interface';

export interface CustomerUpdateInput
  extends Omit<Partial<CustomerCreateInput>, 'auth0Id'> {}
