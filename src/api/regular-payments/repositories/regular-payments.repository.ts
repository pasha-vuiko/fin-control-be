import { ExpenseCategory } from '@prisma/client';
import { SQLWrapper, and, eq } from 'drizzle-orm';

import { Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { CatchErrors } from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { getPrismaPaginationParams } from '@shared/modules/prisma/utils/get-prisma-pagination-params';
import { handlePrismaError } from '@shared/modules/prisma/utils/handle-prisma-error';

import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';
import { IRegularPaymentUpdateInput } from '@api/regular-payments/interfaces/regular-payment-update-input.interface';
import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';
import {
  IRegularPaymentsFilter,
  IRegularPaymentsRepository,
} from '@api/regular-payments/interfaces/regular-payments-repository.interface';

import { RegularPayment } from '../../../../prisma/drizzle/schema';

@Injectable()
export class RegularPaymentsRepository implements IRegularPaymentsRepository {
  constructor(private prismaService: PrismaService) {}

  @CatchErrors(handlePrismaError)
  async findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IRegularPayment>> {
    const { take, skip } = getPrismaPaginationParams(pagination);
    const { customerId } = filter;

    const whereConditions: SQLWrapper[] = [];

    if (customerId) {
      whereConditions.push(eq(RegularPayment.customerId, customerId));
    }

    return await this.prismaService.$drizzle
      .transaction(
        async tx =>
          await Promise.all([
            tx
              .select()
              .from(RegularPayment)
              .where(and(...whereConditions))
              .limit(take)
              .offset(skip),
            tx.$count(RegularPayment, and(...whereConditions)),
          ]),
        { isolationLevel: 'repeatable read' },
      )
      .then(([regularPayments, total]) => ({
        items: this.mapPrismaRegularPaymentsToRegularPayments(regularPayments),
        total,
      }));
  }

  @CatchErrors(handlePrismaError)
  async findAll(): Promise<IRegularPayment[]> {
    const regularPayments = await this.prismaService.$drizzle
      .select()
      .from(RegularPayment);

    return regularPayments.map(regularPayment =>
      this.mapPrismaRegularPaymentToRegularPayment(regularPayment),
    );
  }

  @CatchErrors(handlePrismaError)
  async findOne(id: string): Promise<IRegularPayment | null> {
    const [regularPayment] = await this.prismaService.$drizzle
      .select()
      .from(RegularPayment)
      .where(eq(RegularPayment.id, id));

    if (!regularPayment) {
      return null;
    }

    return this.mapPrismaRegularPaymentToRegularPayment(regularPayment);
  }

  @CatchErrors(handlePrismaError)
  async create(data: IRegularPaymentCreateInput): Promise<IRegularPayment> {
    const { amount, dateOfCharge, createdAt, updatedAt } = data;

    const [createdRegularPayment] = await this.prismaService.$drizzle
      .insert(RegularPayment)
      .values({
        ...data,
        amount: amount.toString(),
        dateOfCharge: new Date(dateOfCharge),
        createdAt: createdAt ? new Date(createdAt) : undefined,
        updatedAt: updatedAt ? new Date(updatedAt) : undefined,
      })
      .returning();

    return this.mapPrismaRegularPaymentToRegularPayment(createdRegularPayment);
  }

  @CatchErrors(handlePrismaError)
  async update(id: string, data: IRegularPaymentUpdateInput): Promise<IRegularPayment> {
    const { amount, dateOfCharge, createdAt, updatedAt } = data;

    const [updatedRegularPayment] = await this.prismaService.$drizzle
      .update(RegularPayment)
      .set({
        ...data,
        amount: amount?.toString(),
        dateOfCharge: dateOfCharge ? new Date(dateOfCharge) : undefined,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        updatedAt: updatedAt ? new Date(updatedAt) : undefined,
      })
      .where(eq(RegularPayment.id, id))
      .returning();

    return this.mapPrismaRegularPaymentToRegularPayment(updatedRegularPayment);
  }

  @CatchErrors(handlePrismaError)
  async delete(id: string): Promise<IRegularPayment | null> {
    const [deletedRegularPayment] = await this.prismaService.$drizzle
      .delete(RegularPayment)
      .where(eq(RegularPayment.id, id))
      .returning();

    if (!deletedRegularPayment) {
      return null;
    }

    return this.mapPrismaRegularPaymentToRegularPayment(deletedRegularPayment);
  }

  private mapPrismaRegularPaymentsToRegularPayments(
    prismaRegularPayments: IRegularPaymentFromDb[],
  ): IRegularPayment[] {
    return prismaRegularPayments.map(prismaRegularPayment =>
      this.mapPrismaRegularPaymentToRegularPayment(prismaRegularPayment),
    );
  }

  private mapPrismaRegularPaymentToRegularPayment(
    prismaRegularPayment: IRegularPaymentFromDb,
  ): IRegularPayment {
    return {
      ...prismaRegularPayment,
      amount: Number(prismaRegularPayment.amount),
    };
  }
}

interface IRegularPaymentFromDb {
  id: string;
  customerId: string;
  amount: string;
  dateOfCharge: Date;
  createdAt: Date;
  updatedAt: Date;
  category: `${ExpenseCategory}`;
}
