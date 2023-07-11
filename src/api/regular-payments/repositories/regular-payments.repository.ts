import { Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { Catch } from '@shared/modules/error/decorators/catch.decorator';
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

import { RegularPayment } from '../../../../prisma/client';

@Injectable()
export class RegularPaymentsRepository implements IRegularPaymentsRepository {
  constructor(private prisma: PrismaService) {}

  @Catch(handlePrismaError)
  async findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IRegularPayment>> {
    const { take, skip } = getPrismaPaginationParams(pagination);
    const { customerId } = filter;

    const { regularPayments, total } = await this.prisma.$transaction(async tx => {
      const total = await tx.regularPayment.count({ where: { customerId } });
      const regularPayments = await tx.regularPayment
        .findMany({
          where: { customerId },
          skip,
          take,
        })
        .then(regularPayments =>
          regularPayments.map(regularPayment =>
            this.mapPrismaRegularPaymentToRegularPayment(regularPayment),
          ),
        );

      return { regularPayments, total };
    });

    return { items: regularPayments, total };
  }

  @Catch(handlePrismaError)
  async findAll(): Promise<IRegularPayment[]> {
    const regularPayments = await this.prisma.regularPayment.findMany();

    return regularPayments.map(regularPayment =>
      this.mapPrismaRegularPaymentToRegularPayment(regularPayment),
    );
  }

  @Catch(handlePrismaError)
  async findOne(id: string): Promise<IRegularPayment | null> {
    const regularPayment = await this.prisma.regularPayment.findUnique({ where: { id } });

    if (!regularPayment) {
      return null;
    }

    return this.mapPrismaRegularPaymentToRegularPayment(regularPayment);
  }

  @Catch(handlePrismaError)
  async create(data: IRegularPaymentCreateInput): Promise<IRegularPayment> {
    const createdRegularPayment = await this.prisma.regularPayment.create({ data });

    return this.mapPrismaRegularPaymentToRegularPayment(createdRegularPayment);
  }

  @Catch(handlePrismaError)
  async update(id: string, data: IRegularPaymentUpdateInput): Promise<IRegularPayment> {
    const updatedRegularPayment = await this.prisma.regularPayment.update({
      data,
      where: { id },
    });

    return this.mapPrismaRegularPaymentToRegularPayment(updatedRegularPayment);
  }

  @Catch(handlePrismaError)
  async delete(id: string): Promise<IRegularPayment> {
    const deletedRegularPayment = await this.prisma.regularPayment.delete({
      where: { id },
    });

    return this.mapPrismaRegularPaymentToRegularPayment(deletedRegularPayment);
  }

  private mapPrismaRegularPaymentToRegularPayment(
    prismaRegularPayment: RegularPayment,
  ): IRegularPayment {
    return {
      ...prismaRegularPayment,
      amount: prismaRegularPayment.amount.toNumber(),
    };
  }
}
