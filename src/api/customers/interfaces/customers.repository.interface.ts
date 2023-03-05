import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';
import { IUpdateCustomerInput } from '@api/customers/interfaces/update-customer-input.interface';

export interface ICustomersRepository {
  findMany(): Promise<ICustomer[]>;

  findOne(id: string): Promise<ICustomer | null>;

  create(data: ICreateCustomerInput): Promise<ICustomer>;

  update(id: string, data: IUpdateCustomerInput): Promise<ICustomer>;

  remove(id: string): Promise<ICustomer>;
}
