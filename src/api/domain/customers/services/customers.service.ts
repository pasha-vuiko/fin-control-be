import { Inject, Injectable } from '@nestjs/common';

import { BindContext } from '@shared/decorators/bind-context.decorator';
import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';

import { CustomerEntity } from '@api/domain/customers/entities/customer.entity';
import {
  CustomerNotFoundException,
  ForbiddenToDeleteCustomerException,
} from '@api/domain/customers/exceptions/exception-classes';
import { ICustomerFromDb } from '@api/domain/customers/interfaces/customer-from-db.interface';
import { ICustomersRepository } from '@api/domain/customers/interfaces/customers.repository.interface';
import { CustomersRepository } from '@api/domain/customers/repositories/customers.repository';

import { CustomerCreateDto } from '../dto/customer-create.dto';
import { CustomerUpdateDto } from '../dto/customer-update.dto';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository)
    private readonly customerRepository: ICustomersRepository,
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
    return await this.customerRepository
      .findOneById(id)
      .then(this.throwNotFoundIfCustomerNotDefined)
      .then(CustomerEntity.fromCustomerObj);
  }

  async findOneByUserId(userId: string): Promise<CustomerEntity> {
    return await this.customerRepository
      .findOneByUserId(userId)
      .then(this.throwNotFoundIfCustomerNotDefined)
      .then(CustomerEntity.fromCustomerObj);
  }

  async create(
    createCustomerDto: CustomerCreateDto,
    user: IUser,
  ): Promise<CustomerEntity> {
    const { id, email } = user;

    return await this.customerRepository
      .create({
        ...createCustomerDto,
        birthdate: new Date(createCustomerDto.birthdate),
        userId: id,
        email,
      })
      .then(CustomerEntity.fromCustomerObj);
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
      .then(this.throwNotFoundIfCustomerNotDefined)
      .then(CustomerEntity.fromCustomerObj);
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
      .then(this.throwNotFoundIfCustomerNotDefined)
      .then(CustomerEntity.fromCustomerObj);
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
      .then(this.throwNotFoundIfCustomerNotDefined)
      .then(CustomerEntity.fromCustomerObj);
  }

  async removeAsAdmin(id: string): Promise<CustomerEntity> {
    return await this.customerRepository
      .remove(id)
      .then(this.throwNotFoundIfCustomerNotDefined)
      .then(CustomerEntity.fromCustomerObj);
  }

  @BindContext()
  private throwNotFoundIfCustomerNotDefined(
    customer: ICustomerFromDb | null,
  ): ICustomerFromDb {
    if (!customer) {
      throw new CustomerNotFoundException();
    }

    return customer;
  }
}
