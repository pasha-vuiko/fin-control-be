import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { CustomerCreateInput } from '@api/domain/customers/interfaces/customer-create-input.interface';
import { CustomerFromDb } from '@api/domain/customers/interfaces/customer-from-db.interface';
import { CustomerUpdateInput } from '@api/domain/customers/interfaces/customer-update-input.interface';

export interface ICustomersRepository {
  findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<CustomerFromDb>>;

  findOneById(id: string): Promise<CustomerFromDb | null>;

  findOneByUserId(id: string): Promise<CustomerFromDb | null>;

  create(data: CustomerCreateInput): Promise<CustomerFromDb>;

  update(id: string, data: CustomerUpdateInput): Promise<CustomerFromDb | null>;

  remove(id: string): Promise<CustomerFromDb | null>;
}
