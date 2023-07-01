import { IPagination } from '@shared/interfaces/pagination.interface';

import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';
import { ICustomerUpdateInput } from '@api/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';

export interface ICustomersRepository {
  findMany(pagination?: IPagination): Promise<ICustomer[]>;

  findOneById(id: string): Promise<ICustomer | null>;

  findOneByUserId(id: string): Promise<ICustomer | null>;

  create(data: ICustomerCreateInput): Promise<ICustomer>;

  update(id: string, data: ICustomerUpdateInput): Promise<ICustomer>;

  remove(id: string): Promise<ICustomer>;
}
