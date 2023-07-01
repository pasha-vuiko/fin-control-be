import { Injectable } from '@nestjs/common';

import { IPagination } from '@shared/interfaces/pagination.interface';
import { Catch } from '@shared/modules/error/decorators/catch.decorator';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { handlePrismaError } from '@shared/modules/prisma/utils/handle-prisma-error';
import { mergePaginationWithDefault } from '@shared/utils/merge-pagination-with-default';

import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';
import { ICustomerUpdateInput } from '@api/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';

import { Customer } from '../../../../prisma/client';

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private prismaService: PrismaService) {}

  @Catch(handlePrismaError)
  async findMany(pagination?: IPagination): Promise<ICustomer[]> {
    const { skip, take } = mergePaginationWithDefault(pagination);

    const foundCustomers = await this.prismaService.customer.findMany({ skip, take });

    return foundCustomers.map(foundCustomer =>
      this.mapCustomerFromPrismaToCustomer(foundCustomer),
    );
  }

  @Catch(handlePrismaError)
  async findOneById(id: string): Promise<ICustomer | null> {
    const foundCustomer = await this.prismaService.customer.findUnique({ where: { id } });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  @Catch(handlePrismaError)
  async findOneByUserId(userId: string): Promise<ICustomer | null> {
    const foundCustomer = await this.prismaService.customer.findUnique({
      where: { userId },
    });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  @Catch(handlePrismaError)
  async create(data: ICustomerCreateInput): Promise<ICustomer> {
    const createdCustomer = await this.prismaService.customer.create({ data });

    return this.mapCustomerFromPrismaToCustomer(createdCustomer);
  }

  @Catch(handlePrismaError)
  async update(id: string, data: ICustomerUpdateInput): Promise<ICustomer> {
    const updatedCustomer = await this.prismaService.customer.update({
      data: data,
      where: { id },
    });

    return this.mapCustomerFromPrismaToCustomer(updatedCustomer);
  }

  @Catch(handlePrismaError)
  async remove(id: string): Promise<ICustomer> {
    const removedCustomer = await this.prismaService.customer.delete({ where: { id } });

    return this.mapCustomerFromPrismaToCustomer(removedCustomer);
  }

  private mapCustomerFromPrismaToCustomer(customer: Customer): ICustomer {
    return {
      id: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      birthdate: customer.birthdate,
      email: customer.email,
      phone: customer.phone,
      sex: customer.sex,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
