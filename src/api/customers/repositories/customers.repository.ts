import { Customer as PrismaCustomer } from '@prisma-definitions/client';
import { eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';

import { Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { CatchErrors } from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { getPrismaPaginationParams } from '@shared/modules/prisma/utils/get-prisma-pagination-params';
import { handlePrismaError } from '@shared/modules/prisma/utils/handle-prisma-error';

import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';
import { ICustomerUpdateInput } from '@api/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';

import { Customer } from '../../../../prisma/drizzle/schema';
import * as drizzleSchema from '../../../../prisma/drizzle/schema';

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  private readonly drizzle: NodePgDatabase<typeof drizzleSchema>;
  private getOneByIdPreparedQuery = PrismaService.getDrizzle()
    .select()
    .from(Customer)
    .where(eq(Customer.id, sql.placeholder('id')))
    .prepare('getOneByIdPreparedQuery');

  constructor(private prismaService: PrismaService) {
    this.drizzle = prismaService.getDrizzleWithSchema(drizzleSchema);
  }

  @CatchErrors(handlePrismaError)
  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ICustomer>> {
    const { skip, take } = getPrismaPaginationParams(pagination);

    return await this.drizzle
      .transaction(
        async tx => {
          const customers = await tx.select().from(Customer).limit(take).offset(skip);
          const total = await tx.$count(Customer);

          return { customers, total };
        },
        { isolationLevel: 'repeatable read' },
      )
      .then(({ customers, total }) => ({
        items: this.mapCustomersFromPrismaToCustomers(customers),
        total,
      }));
  }

  @CatchErrors(handlePrismaError)
  async findOneById(id: string): Promise<ICustomer | null> {
    const [foundCustomer] = await this.getOneByIdPreparedQuery.execute({ id });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  @CatchErrors(handlePrismaError)
  async findOneByUserId(userId: string): Promise<ICustomer | null> {
    const foundCustomer = await this.drizzle.query.Customer.findFirst({
      where: eq(Customer.userId, userId),
      with: { expense: true },
    });

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromPrismaToCustomer(foundCustomer);
  }

  @CatchErrors(handlePrismaError)
  async create(data: ICustomerCreateInput): Promise<ICustomer> {
    const { birthdate, createdAt, updatedAt } = data;

    return await this.prismaService.$drizzle
      .insert(Customer)
      .values({
        ...data,
        birthdate: typeof birthdate === 'string' ? new Date(birthdate) : birthdate,
        createdAt: typeof createdAt === 'string' ? new Date(createdAt) : createdAt,
        updatedAt: typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt,
      })
      .returning()
      .then(([createdCustomer]) => this.mapCustomerFromPrismaToCustomer(createdCustomer));
  }

  @CatchErrors(handlePrismaError)
  async update(id: string, data: ICustomerUpdateInput): Promise<ICustomer | null> {
    const { birthdate, createdAt, updatedAt } = data;

    return await this.drizzle
      .update(Customer)
      .set({
        ...data,
        birthdate: typeof birthdate === 'string' ? new Date(birthdate) : birthdate,
        createdAt: typeof createdAt === 'string' ? new Date(createdAt) : createdAt,
        updatedAt: typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt,
      })
      .where(eq(Customer.id, id))
      .returning()
      .then(([updatedCustomer]) => {
        if (!updatedCustomer) {
          return null;
        }
        return this.mapCustomerFromPrismaToCustomer(updatedCustomer);
      });
  }

  @CatchErrors(handlePrismaError)
  async remove(id: string): Promise<ICustomer | null> {
    return await this.drizzle
      .delete(Customer)
      .where(eq(Customer.id, id))
      .returning()
      .then(([removedCustomer]) => {
        if (!removedCustomer) {
          return null;
        }
        return this.mapCustomerFromPrismaToCustomer(removedCustomer);
      });
  }

  private mapCustomersFromPrismaToCustomers(customers: PrismaCustomer[]): ICustomer[] {
    return customers.map(customer => this.mapCustomerFromPrismaToCustomer(customer));
  }

  private mapCustomerFromPrismaToCustomer(customer: PrismaCustomer): ICustomer {
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
