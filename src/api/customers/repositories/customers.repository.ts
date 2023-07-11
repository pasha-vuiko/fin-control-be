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

import { Customer } from '../../../../prisma/client';

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private prismaService: PrismaService) {}

  @Catch(handlePrismaError)
  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ICustomer>> {
    const { customers, total } = await this.prismaService.$transaction(async tx => {
      const { take, skip } = getPrismaPaginationParams(pagination);

      const total = await tx.customer.count();
      const customers = await tx.customer
        .findMany({
          take,
          skip,
        })
        .then(customers =>
          customers.map(customer => this.mapCustomerFromPrismaToCustomer(customer)),
        );

      return { customers, total };
    });

    return {
      items: customers,
      total,
    };
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
