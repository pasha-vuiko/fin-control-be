import { Inject, Injectable } from '@nestjs/common';

import { BindContext } from '@shared/decorators/bind-context.decorator';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { DKronService } from '@shared/modules/d-kron/services/d-kron/d-kron.service';

import { CustomersService } from '@api/domain/customers/services/customers.service';
import { RegularPaymentEntity } from '@api/domain/regular-payments/entities/regular-payment.entity';
import { RegularPaymentNotFoundException } from '@api/domain/regular-payments/exceptions/exception-classes';
import { IRegularPaymentUpdateInput } from '@api/domain/regular-payments/interfaces/regular-payment-update-input.interface';
import { IRegularPayment } from '@api/domain/regular-payments/interfaces/regular-payment.interface';
import { IRegularPaymentsRepository } from '@api/domain/regular-payments/interfaces/regular-payments-repository.interface';
import { RegularPaymentsRepository } from '@api/domain/regular-payments/repositories/regular-payments.repository';
import { JobType } from '@api/shared/jobs/enums/job-type.enum';

import { RegularPaymentCreateDto } from '../dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from '../dto/regular-payment-update.dto';

@Injectable()
export class RegularPaymentsService {
  constructor(
    @Inject(RegularPaymentsRepository)
    private readonly regularPaymentsRepository: IRegularPaymentsRepository,
    private readonly customersService: CustomersService,
    private readonly dKronService: DKronService,
  ) {}

  async findManyAsAdmin(
    pagination: IPagePaginationInput,
  ): Promise<PagePaginationOutputEntity<RegularPaymentEntity>> {
    const { items, total } = await this.regularPaymentsRepository.findMany(
      {},
      pagination,
    );

    return new PagePaginationOutputEntity<RegularPaymentEntity>({
      items: items.map(RegularPaymentEntity.fromPlainObj),
      total,
    });
  }

  async findManyAsCustomer(
    userId: string,
    pagination: IPagePaginationInput,
  ): Promise<PagePaginationOutputEntity<RegularPaymentEntity>> {
    const customer = await this.customersService.findOneByUserId(userId);

    const { items, total } = await this.regularPaymentsRepository.findMany(
      { customerId: customer.id },
      pagination,
    );

    return new PagePaginationOutputEntity<RegularPaymentEntity>({
      items: items.map(RegularPaymentEntity.fromPlainObj),
      total,
    });
  }

  async findOneAsAdmin(id: string): Promise<RegularPaymentEntity> {
    const regularPayment = await this.regularPaymentsRepository.findOne(id);

    if (!regularPayment) {
      throw new RegularPaymentNotFoundException();
    }

    return RegularPaymentEntity.fromPlainObj(regularPayment);
  }

  async findOneAsCustomer(id: string, userId: string): Promise<RegularPaymentEntity> {
    const [regularPayment, customer] = await Promise.all([
      this.regularPaymentsRepository.findOne(id),
      this.customersService.findOneByUserId(userId),
    ]);

    if (!regularPayment || regularPayment.customerId !== customer.id) {
      throw new RegularPaymentNotFoundException();
    }

    return RegularPaymentEntity.fromPlainObj(regularPayment);
  }

  async create(
    createRegularPaymentDto: RegularPaymentCreateDto,
    userId: string,
  ): Promise<RegularPaymentEntity> {
    const customer = await this.customersService.findOneByUserId(userId);

    const regularExpense = await this.regularPaymentsRepository.create({
      ...createRegularPaymentDto,
      customerId: customer.id,
      amount: createRegularPaymentDto.amount.toString(),
      dateOfCharge: new Date(createRegularPaymentDto.dateOfCharge),
    });

    await this.upsertSchedulerJob(regularExpense.id, regularExpense.dateOfCharge);

    return RegularPaymentEntity.fromPlainObj(regularExpense);
  }

  async update(
    id: string,
    updateRegularPaymentDto: RegularPaymentUpdateDto,
    userId: string,
  ): Promise<IRegularPayment> {
    await this.findOneAsCustomer(id, userId); // check if regular payment exists

    const updateInput: IRegularPaymentUpdateInput = {
      ...updateRegularPaymentDto,
      amount: updateRegularPaymentDto.amount?.toString(),
      dateOfCharge: updateRegularPaymentDto.dateOfCharge
        ? new Date(updateRegularPaymentDto.dateOfCharge)
        : undefined,
    };

    const regularExpense = await this.regularPaymentsRepository
      .update(id, updateInput)
      .then(this.throwNotFoundIfRegularPaymentNotDefined);

    await this.upsertSchedulerJob(regularExpense.id, regularExpense.dateOfCharge);

    return RegularPaymentEntity.fromPlainObj(regularExpense);
  }

  async delete(id: string, userId: string): Promise<IRegularPayment | null> {
    await this.findOneAsCustomer(id, userId); // check if regular payment exists

    return await this.regularPaymentsRepository
      .delete(id)
      .then(this.throwNotFoundIfRegularPaymentNotDefined)
      .then(RegularPaymentEntity.fromPlainObj);
  }

  @BindContext()
  private throwNotFoundIfRegularPaymentNotDefined(
    regularPayment: IRegularPayment | null,
  ): IRegularPayment {
    if (!regularPayment) {
      throw new RegularPaymentNotFoundException();
    }

    return regularPayment;
  }

  private async upsertSchedulerJob(
    regularPaymentId: string,
    dateOfCharge: Date,
  ): Promise<void> {
    const jobType = JobType.REGULAR_PAYMENT_APPLY;
    const jobName = `${jobType}-${regularPaymentId}`;

    await this.dKronService.createHttpCronJob(
      jobName,
      [{ dayOfMonth: dateOfCharge.getMonth() + 1 }],
      {
        jobType,
        payload: {
          regularPaymentId,
        },
      },
    );
  }
}
