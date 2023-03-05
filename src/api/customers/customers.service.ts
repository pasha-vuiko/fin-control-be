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
import { Roles } from '@shared/modules/auth/enums/roles';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository) private customerRepository: ICustomersRepository,
  ) {}

  findMany(): Promise<CustomerEntity[]> {
    return this.customerRepository.findMany();
  }

  async findOne(id: string, user: IUser): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOne(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer was not found');
    }

    if (user.roles.includes(Roles.CUSTOMER) && foundCustomer.auth0Id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return foundCustomer;
  }

  create(createCustomerDto: CreateCustomerDto, user: IUser): Promise<CustomerEntity> {
    const { id, email } = user;

    return this.customerRepository.create({
      ...createCustomerDto,
      birthdate: new Date(createCustomerDto.birthdate),
      auth0Id: id,
      email,
    });
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    user: IUser,
  ): Promise<CustomerEntity> {
    const foundCustomer = await this.customerRepository.findOne(id);

    if (!foundCustomer) {
      throw new NotFoundException('The customer not found');
    }

    if (user.roles.includes(Roles.CUSTOMER) && foundCustomer.auth0Id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.customerRepository.update(id, updateCustomerDto);
  }

  remove(id: string): Promise<CustomerEntity> {
    return this.customerRepository.remove(id);
  }
}
