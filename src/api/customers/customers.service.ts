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

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository) private customerRepository: ICustomersRepository,
  ) {}

  findMany(): Promise<CustomerEntity[]> {
    return this.customerRepository.findMany();
  }

  async findOne(id: string, userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer || foundCustomer.userId !== userId) {
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

  async update(
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

  async remove(id: string, userId: string): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOneById(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer not found');
    }

    if (foundCustomer.userId !== userId) {
      throw new ForbiddenException('The customer not found');
    }

    return this.customerRepository.remove(id);
  }
}
