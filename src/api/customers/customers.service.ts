import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { CustomersRepository } from '@api/customers/repositories/customers.repository';
import { CustomerEntity } from '@api/customers/entities/customer.entity';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { PaginationDto } from '@shared/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository) private customerRepository: ICustomersRepository,
  ) {}

  findMany(pagination?: PaginationDto): Promise<CustomerEntity[]> {
    return this.customerRepository.findMany(pagination);
  }

  async findOneByIdAsCustomer(id: string, userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer || foundCustomer.userId !== userId) {
      throw new NotFoundException('The customer was not found');
    }

    return foundCustomer;
  }

  async findOneByIdAsAdmin(id: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer was not found');
    }

    return foundCustomer;
  }

  async findOneByUserId(userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneByUserId(userId);

    if (!foundCustomer) {
      throw new NotFoundException('The customer was not found');
    }

    return foundCustomer;
  }

  create(createCustomerDto: CreateCustomerDto, user: IUser): Promise<CustomerEntity> {
    const { id, email } = user;

    return this.customerRepository.create({
      ...createCustomerDto,
      birthdate: new Date(createCustomerDto.birthdate),
      userId: id,
      email,
    });
  }

  async updateAsCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    userId: string,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer || foundCustomer.userId !== userId) {
      throw new NotFoundException('The customer not found');
    }

    return this.customerRepository.update(id, updateCustomerDto);
  }

  async updateAsAdmin(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer not found');
    }

    return this.customerRepository.update(id, updateCustomerDto);
  }

  async removeAsCustomer(id: string, userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer not found');
    }

    if (foundCustomer.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this customer');
    }

    return this.customerRepository.remove(id);
  }

  removeAsAdmin(id: string): Promise<CustomerEntity> {
    return this.customerRepository.remove(id);
  }
}
