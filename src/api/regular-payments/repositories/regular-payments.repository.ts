import { count, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { Inject, Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { Catch } from '@shared/modules/error/decorators/catch.decorator';
import { deleteUndefinedFieldsFromObj } from '@shared/utils/delete-undefined-fields-from-obj.util';
import { getDbPaginationParams } from '@shared/utils/get-db-pagination-params';

import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';
import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';
import { IRegularPaymentUpdateInput } from '@api/regular-payments/interfaces/regular-payment-update-input.interface';
import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';
import {
  IRegularPaymentsFilter,
  IRegularPaymentsRepository,
} from '@api/regular-payments/interfaces/regular-payments-repository.interface';

import * as schema from '../../../drizzle/schema';
import { RegularPayment } from '../../../drizzle/schema';

@Injectable()
export class RegularPaymentsRepository implements IRegularPaymentsRepository {
  constructor(
    @Inject(DRIZZLE_CLIENT)
    private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IRegularPayment>> {
    const { take, skip } = getDbPaginationParams(pagination);
    const { customerId = '' } = filter;

    return await this.drizzle
      .transaction(
        async tx => {
          const items = await tx
            .select()
            .from(RegularPayment)
            .where(eq(RegularPayment.customerId, customerId))
            .limit(take)
            .offset(skip);

          const [{ value: total }] = await tx
            .select({ value: count() })
            .from(RegularPayment)
            .where(eq(RegularPayment.customerId, customerId));

          return { items, total };
        },
        { isolationLevel: 'repeatable read' },
      )
      .then(({ items, total }) => ({
        items: this.mapDrizzleRegularPaymentsToRegularPayments(items),
        total,
      }));
  }

  async findAll(): Promise<IRegularPayment[]> {
    return await this.drizzle
      .select()
      .from(RegularPayment)
      .then(regularPayments =>
        this.mapDrizzleRegularPaymentsToRegularPayments(regularPayments),
      );
  }

  async findOne(id: string): Promise<IRegularPayment | null> {
    const [regularPayment] = await this.drizzle
      .select()
      .from(RegularPayment)
      .where(eq(RegularPayment.id, id));

    if (!regularPayment) {
      return null;
    }

    return this.mapDrizzleRegularPaymentToRegularPayment(regularPayment);
  }

  async create(data: IRegularPaymentCreateInput): Promise<boolean> {
    await this.drizzle.insert(RegularPayment).values([
      {
        ...data,
        id: crypto.randomUUID(),
        amount: data.amount.toString(),
      },
    ]);

    return true;
  }

  async update(id: string, data: IRegularPaymentUpdateInput): Promise<boolean> {
    await this.drizzle
      .update(RegularPayment)
      .set(
        deleteUndefinedFieldsFromObj({
          ...data,
          amount: data.amount?.toString(),
        }),
      )
      .where(eq(RegularPayment.id, id));

    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.drizzle.delete(RegularPayment).where(eq(RegularPayment.id, id));

    return true;
  }

  private mapDrizzleRegularPaymentsToRegularPayments(
    prismaRegularPayments: IDrizzleRegularPayment[],
  ): IRegularPayment[] {
    return prismaRegularPayments.map(prismaRegularPayment =>
      this.mapDrizzleRegularPaymentToRegularPayment(prismaRegularPayment),
    );
  }

  private mapDrizzleRegularPaymentToRegularPayment(
    drizzleRegularPayment: IDrizzleRegularPayment,
  ): IRegularPayment {
    return {
      ...drizzleRegularPayment,
      amount: parseFloat(drizzleRegularPayment.amount),
      dateOfCharge: new Date(drizzleRegularPayment.dateOfCharge),
      createdAt: new Date(drizzleRegularPayment.createdAt),
      updatedAt: new Date(drizzleRegularPayment.updatedAt),
      category: drizzleRegularPayment.category as ExpenseCategory,
    };
  }
}

interface IDrizzleRegularPayment {
  id: string;
  amount: string;
  dateOfCharge: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  customerId: string;
}
