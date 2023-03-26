import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';
import { IUpdateCustomerInput } from '@api/customers/interfaces/update-customer-input.interface';
import { IPagination } from '@shared/interfaces/pagination.interface';

export interface ICustomersRepository {
  findMany(pagination?: IPagination): Promise<ICustomer[]>;

  findOneById(id: string): Promise<ICustomer | null>;

  findOneByUserId(id: string): Promise<ICustomer | null>;

  create(data: ICreateCustomerInput): Promise<ICustomer>;

  update(id: string, data: IUpdateCustomerInput): Promise<ICustomer>;

  remove(id: string): Promise<ICustomer>;
}
