import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';
import { ICreateCustomerInput } from '@api/customers/interfaces/create-customer-input.interface';
import { IUpdateCustomerInput } from '@api/customers/interfaces/update-customer-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Customer } from '../../../../prisma/client';
import { IPagination } from '@shared/interfaces/pagination.interface';
import { mergePaginationWithDefault } from '@shared/utils/merge-pagination-with-default';
import type { PrismaClientKnownRequestError } from '../../../../prisma/client/runtime';
import { PrismaError } from 'prisma-error-enum';

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(private prismaService: PrismaService) {}

  async findMany(pagination?: IPagination): Promise<ICustomer[]> {
    const { skip, take } = mergePaginationWithDefault(pagination);

    const foundCustomers = await this.prismaService.customer.findMany({ skip, take });

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
      where: { userId },
    });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  async create(data: ICreateCustomerInput): Promise<ICustomer> {
    try {
      const createdCustomer = await this.prismaService.customer.create({ data });

      return this.mapCustomerFromPrismaToCustomer(createdCustomer);
    } catch (e: PrismaClientKnownRequestError | any) {
      if (e.code === PrismaError.UniqueConstraintViolation) {
        const uniqueConstraintFieldName = e?.meta?.target?.at(0);
        throw new BadRequestException(
          `Customer with this ${uniqueConstraintFieldName} already exists`,
        );
      }

      throw e;
    }
  }

  async update(id: string, data: IUpdateCustomerInput): Promise<ICustomer> {
    const updatedCustomer = await this.prismaService.customer.update({
      data: data,
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
