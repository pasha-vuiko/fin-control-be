import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { ICustomerCreateInput } from '@api/domain/customers/interfaces/customer-create-input.interface';
import { ICustomerFromDb } from '@api/domain/customers/interfaces/customer-from-db.interface';
import { ICustomerUpdateInput } from '@api/domain/customers/interfaces/customer-update-input.interface';

export interface ICustomersRepository {
  findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ICustomerFromDb>>;

  findOneById(id: string): Promise<ICustomerFromDb | null>;

  findOneByUserId(id: string): Promise<ICustomerFromDb | null>;

  create(data: ICustomerCreateInput): Promise<ICustomerFromDb>;

  update(id: string, data: ICustomerUpdateInput): Promise<ICustomerFromDb | null>;

  remove(id: string): Promise<ICustomerFromDb | null>;
}
