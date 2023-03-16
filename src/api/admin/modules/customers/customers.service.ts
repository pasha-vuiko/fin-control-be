import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { UpdateCustomerDto } from '@api/customers/dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository) private customerRepository: ICustomersRepository,
  ) {}

  findMany(): Promise<CustomerEntity[]> {
    return this.customerRepository.findMany();
  }

  async findOne(id: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer was not found');
    }

    return foundCustomer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer not found');
    }

    return this.customerRepository.update(id, updateCustomerDto);
  }

  remove(id: string): Promise<CustomerEntity> {
    return this.customerRepository.remove(id);
  }
}
