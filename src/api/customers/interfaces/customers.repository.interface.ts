import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';
import { ICustomerUpdateInput } from '@api/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';

export interface ICustomersRepository {
  findMany(pagination: IPagePaginationInput): Promise<IPagePaginationOutput<ICustomer>>;

  findOneById(id: string): Promise<ICustomer | null>;

  findOneByUserId(id: string): Promise<ICustomer | null>;

  create(data: ICustomerCreateInput): Promise<ICustomer>;

  update(id: string, data: ICustomerUpdateInput): Promise<ICustomer | null>;

  remove(id: string): Promise<ICustomer | null>;
}
