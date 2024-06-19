import crypto from 'node:crypto';

import { count, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { Inject, Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { getDbPaginationParams } from '@shared/utils/get-db-pagination-params';

import { Sex } from '@api/customers/enums/sex.enum';
import { ICustomerCreateInput } from '@api/customers/interfaces/customer-create-input.interface';
import { ICustomerUpdateInput } from '@api/customers/interfaces/customer-update-input.interface';
import { ICustomer } from '@api/customers/interfaces/customer.interface';
import { ICustomersRepository } from '@api/customers/interfaces/customers.repository.interface';

import * as schema from '../../../drizzle/schema';
import { Customer } from '../../../drizzle/schema';

@Injectable()
export class CustomersRepository implements ICustomersRepository {
  constructor(
    @Inject(DRIZZLE_CLIENT) private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ICustomer>> {
    const { skip, take } = getDbPaginationParams(pagination);

    return await this.drizzle
      .transaction(
        async tx => {
          const customers = await tx.select().from(Customer).limit(take).offset(skip);
          const [{ value: total }] = await tx.select({ value: count() }).from(Customer);

          return { customers, total };
        },
        { isolationLevel: 'repeatable read' },
      )
      .then(({ customers, total }) => ({
        items: this.mapCustomersFromDrizzleToCustomers(customers),
        total,
      }));
  }

  async findOneById(id: string): Promise<ICustomer | null> {
    const [foundCustomer] = await this.drizzle
      .select()
      .from(Customer)
      .where(eq(Customer.id, id));

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromDrizzleToCustomer(foundCustomer);
  }

  async findOneByUserId(userId: string): Promise<ICustomer | null> {
    const [foundCustomer] = await this.drizzle
      .select()
      .from(Customer)
      .where(eq(Customer.userId, userId));

    if (!foundCustomer) {
      return null;
    }

    return this.mapCustomerFromDrizzleToCustomer(foundCustomer);
  }

  async create(data: ICustomerCreateInput): Promise<boolean> {
    await this.drizzle.insert(Customer).values({
      id: crypto.randomUUID(),
      ...data,
    });

    return true;
  }

  async update(id: string, data: ICustomerUpdateInput): Promise<boolean> {
    await this.drizzle.update(Customer).set(data).where(eq(Customer.id, id));

    return true;
  }

  async remove(id: string): Promise<boolean> {
    await this.drizzle.delete(Customer).where(eq(Customer.id, id));

    return true;
  }

  private mapCustomersFromDrizzleToCustomers(customers: IDrizzleCustomer[]): ICustomer[] {
    return customers.map(customer => this.mapCustomerFromDrizzleToCustomer(customer));
  }

  private mapCustomerFromDrizzleToCustomer(customer: IDrizzleCustomer): ICustomer {
    return {
      id: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      birthdate: new Date(customer.birthdate),
      email: customer.email,
      phone: customer.phone,
      sex: customer.sex as Sex,
      createdAt: new Date(customer.createdAt),
      updatedAt: new Date(customer.updatedAt),
    };
  }
}

interface IDrizzleCustomer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthdate: string;
  sex: 'MALE' | 'FEMALE';
  createdAt: string;
  updatedAt: string;
}
