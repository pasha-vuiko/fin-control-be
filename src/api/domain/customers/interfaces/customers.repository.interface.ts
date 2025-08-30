import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { CustomerCreateInput } from '@api/domain/customers/interfaces/customer-create-input.interface';
import { CustomerUpdateInput } from '@api/domain/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/domain/customers/interfaces/customer.interface';

export interface ICustomersRepository {
  findMany(pagination: IPagePaginationInput): Promise<IPagePaginationOutput<ICustomer>>;

  findOneById(id: string): Promise<ICustomer | null>;

  findOneByUserId(id: string): Promise<ICustomer | null>;

  create(data: CustomerCreateInput): Promise<ICustomer>;

  update(id: string, data: CustomerUpdateInput): Promise<ICustomer | null>;

  remove(id: string): Promise<ICustomer | null>;
}
