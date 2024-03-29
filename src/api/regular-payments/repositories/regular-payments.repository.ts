import { RegularPayment } from '@prisma/client';

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

@Injectable()
export class RegularPaymentsRepository implements IRegularPaymentsRepository {
  constructor(private prismaService: PrismaService) {}

  @Catch(handlePrismaError)
  async findMany(
    filter: IRegularPaymentsFilter,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IRegularPayment>> {
    const { take, skip } = getPrismaPaginationParams(pagination);
    const { customerId } = filter;

    return await this.prismaService
      .$transaction([
        this.prismaService.regularPayment.findMany({
          where: { customerId },
          skip,
          take,
        }),
        this.prismaService.regularPayment.count({ where: { customerId } }),
      ])
      .then(([regularPayments, total]) => ({
        items: this.mapPrismaRegularPaymentsToRegularPayments(regularPayments),
        total,
      }));
  }

  @Catch(handlePrismaError)
  async findAll(): Promise<IRegularPayment[]> {
    const regularPayments = await this.prismaService.regularPayment.findMany();

    return regularPayments.map(regularPayment =>
      this.mapPrismaRegularPaymentToRegularPayment(regularPayment),
    );
  }

  @Catch(handlePrismaError)
  async findOne(id: string): Promise<IRegularPayment | null> {
    const regularPayment = await this.prismaService.regularPayment.findUnique({
      where: { id },
    });

    if (!regularPayment) {
      return null;
    }

    return this.mapPrismaRegularPaymentToRegularPayment(regularPayment);
  }

  @Catch(handlePrismaError)
  async create(data: IRegularPaymentCreateInput): Promise<IRegularPayment> {
    const createdRegularPayment = await this.prismaService.regularPayment.create({
      data,
    });

    return this.mapPrismaRegularPaymentToRegularPayment(createdRegularPayment);
  }

  @Catch(handlePrismaError)
  async update(id: string, data: IRegularPaymentUpdateInput): Promise<IRegularPayment> {
    const updatedRegularPayment = await this.prismaService.regularPayment.update({
      data,
      where: { id },
    });

    return this.mapPrismaRegularPaymentToRegularPayment(updatedRegularPayment);
  }

  @Catch(handlePrismaError)
  async delete(id: string): Promise<IRegularPayment> {
    const deletedRegularPayment = await this.prismaService.regularPayment.delete({
      where: { id },
    });

    return this.mapPrismaRegularPaymentToRegularPayment(deletedRegularPayment);
  }

  private mapPrismaRegularPaymentsToRegularPayments(
    prismaRegularPayments: RegularPayment[],
  ): IRegularPayment[] {
    return prismaRegularPayments.map(prismaRegularPayment =>
      this.mapPrismaRegularPaymentToRegularPayment(prismaRegularPayment),
    );
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
