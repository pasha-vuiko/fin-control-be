import { Inject, Injectable } from '@nestjs/common';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';

import { CustomerEntity } from '@api/customers/entities/customer.entity';
import {
  CustomerNotFoundException,
  ForbiddenToDeleteCustomerException,
} from '@api/customers/exceptions/exception-classes';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';

import { CustomerCreateDto } from '../dto/customer-create.dto';
import { CustomerUpdateDto } from '../dto/customer-update.dto';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository) private customerRepository: ICustomersRepository,
  ) {}

  async findMany(
    pagination: PagePaginationDto,
  ): Promise<PagePaginationOutputEntity<CustomerEntity>> {
    const { items, total } = await this.customerRepository.findMany(pagination);

    return new PagePaginationOutputEntity<CustomerEntity>({
      items: items.map(CustomerEntity.fromCustomerObj),
      total,
    });
  }

  async findOneByIdAsAdmin(id: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    return CustomerEntity.fromCustomerObj(foundCustomer);
  }

  async findOneByUserId(userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneByUserId(userId);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    return CustomerEntity.fromCustomerObj(foundCustomer);
  }

  async create(
    createCustomerDto: CustomerCreateDto,
    user: IUser,
  ): Promise<CustomerEntity> {
    const { id, email } = user;

    const createdCustomer = await this.customerRepository.create({
      ...createCustomerDto,
      birthdate: new Date(createCustomerDto.birthdate),
      userId: id,
      email,
    });

    return CustomerEntity.fromCustomerObj(createdCustomer);
  }

  async updateAsCustomer(
    id: string,
    updateCustomerDto: CustomerUpdateDto,
    userId: string,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer || foundCustomer.userId !== userId) {
      throw new CustomerNotFoundException();
    }

    return await this.customerRepository
      .update(id, updateCustomerDto)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  async updateAsAdmin(
    id: string,
    updateCustomerDto: CustomerUpdateDto,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    return await this.customerRepository
      .update(id, updateCustomerDto)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  async removeAsCustomer(id: string, userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new CustomerNotFoundException();
    }

    if (foundCustomer.userId !== userId) {
      throw new ForbiddenToDeleteCustomerException();
    }

    return await this.customerRepository
      .remove(id)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }

  async removeAsAdmin(id: string): Promise<CustomerEntity> {
    return await this.customerRepository
      .remove(id)
      .then(customer => CustomerEntity.fromCustomerObj(customer as ICustomer));
  }
}
