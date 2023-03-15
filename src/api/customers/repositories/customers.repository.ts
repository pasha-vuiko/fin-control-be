import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';
import { IUpdateCustomerInput } from '@api/customers/interfaces/update-customer-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Customer, Prisma } from '../../../../prisma/client';
import CustomerCreateInput = Prisma.CustomerCreateInput;
import { omitObj } from '@shared/utils/omit-obj.util';
import CustomerUpdateInput = Prisma.CustomerUpdateInput;

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private prismaService: PrismaService) {}

  async findMany(): Promise<ICustomer[]> {
    const foundCustomers = await this.prismaService.customer.findMany();

    return foundCustomers.map(foundCustomer =>
      this.mapCustomerFromPrismaToCustomer(foundCustomer),
    );
  }

  async findOneById(id: string): Promise<ICustomer | null> {
    const foundCustomer = await this.prismaService.customer.findUnique({ where: { id } });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  async findOneByUserId(userId: string): Promise<ICustomer | null> {
    const foundCustomer = await this.prismaService.customer.findUnique({
      where: { auth0Id: userId },
    });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  async create(data: ICreateCustomerInput): Promise<ICustomer> {
    const createDataWithoutUserId = omitObj(data, 'userId');
    const createCustomerInput: CustomerCreateInput = {
      ...createDataWithoutUserId,
      auth0Id: data.userId,
    };

    const createdCustomer = await this.prismaService.customer.create({
      data: createCustomerInput,
    });

    return this.mapCustomerFromPrismaToCustomer(createdCustomer);
  }

  async update(id: string, data: IUpdateCustomerInput): Promise<ICustomer> {
    const updateDataWithoutUserId = omitObj(data, 'userId');
    const updateCustomerInput: CustomerUpdateInput = {
      ...updateDataWithoutUserId,
      auth0Id: data.userId,
    };

    const updatedCustomer = await this.prismaService.customer.update({
      data: updateCustomerInput,
      where: { id },
    });

    return this.mapCustomerFromPrismaToCustomer(updatedCustomer);
  }

  async remove(id: string): Promise<ICustomer> {
    const removedCustomer = await this.prismaService.customer.delete({ where: { id } });

    return this.mapCustomerFromPrismaToCustomer(removedCustomer);
  }

  private mapCustomerFromPrismaToCustomer(customer: Customer): ICustomer {
    return {
      id: customer.id,
      userId: customer.auth0Id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      birthdate: customer.birthdate,
      email: customer.email,
      phone: customer.phone,
      sex: customer.sex,
    };
  }
}
