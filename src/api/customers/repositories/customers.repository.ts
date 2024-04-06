import { Customer, Prisma } from '@prisma/client';

import { Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { Catch } from '@shared/modules/error/decorators/catch.decorator';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { getPrismaPaginationParams } from '@shared/modules/prisma/utils/get-prisma-pagination-params';
import { handlePrismaError } from '@shared/modules/prisma/utils/handle-prisma-error';

import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';
import { ICustomerUpdateInput } from '@api/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';

import TransactionIsolationLevel = Prisma.TransactionIsolationLevel;

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private prismaService: PrismaService) {}

  @Catch(handlePrismaError)
  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ICustomer>> {
    const { skip, take } = getPrismaPaginationParams(pagination);

    return await this.prismaService
      .$transaction(
        [
          this.prismaService.customer.findMany({ skip, take }),
          this.prismaService.customer.count(),
        ],
        { isolationLevel: TransactionIsolationLevel.RepeatableRead },
      )
      .then(([customers, total]) => ({
        items: this.mapCustomersFromPrismaToCustomers(customers),
        total,
      }));
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
      include: { expense: true },
    });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  @Catch(handlePrismaError)
  async create(data: ICustomerCreateInput): Promise<ICustomer> {
    return await this.prismaService.customer
      .create({ data })
      .then(createdCustomer => this.mapCustomerFromPrismaToCustomer(createdCustomer));
  }

  @Catch(handlePrismaError)
  async update(id: string, data: ICustomerUpdateInput): Promise<ICustomer> {
    return await this.prismaService.customer
      .update({ data, where: { id } })
      .then(updatedCustomer => this.mapCustomerFromPrismaToCustomer(updatedCustomer));
  }

  @Catch(handlePrismaError)
  async remove(id: string): Promise<ICustomer> {
    return await this.prismaService.customer
      .delete({ where: { id } })
      .then(removedCustomer => this.mapCustomerFromPrismaToCustomer(removedCustomer));
  }

  private mapCustomersFromPrismaToCustomers(customers: Customer[]): ICustomer[] {
    return customers.map(customer => this.mapCustomerFromPrismaToCustomer(customer));
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
