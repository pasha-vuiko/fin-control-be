import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';
import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';

import { CustomersService } from '@api/customers/services/customers.service';
import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';
import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { ExpensesService } from '@api/expenses/services/expenses.service';
import { RegularPaymentEntity } from '@api/regular-payments/entities/regular-payment.entity';
import { IRegularPaymentsRepository } from '@api/regular-payments/interfaces/regular-payments-repository.interface';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentCreateDto } from '../dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from '../dto/regular-payment-update.dto';

@Injectable()
export class RegularPaymentsService {
  constructor(
    @Inject(RegularPaymentsRepository)
    private regularPaymentsRepository: IRegularPaymentsRepository,
    private customersService: CustomersService,
    private expensesService: ExpensesService,
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
      throw new NotFoundException(`Regular payment with id ${id} not found`);
    }

    return RegularPaymentEntity.fromPlainObj(regularPayment);
  }

  async findOneAsCustomer(id: string, userId: string): Promise<RegularPaymentEntity> {
    const [regularPayment, customer] = await Promise.all([
      this.regularPaymentsRepository.findOne(id),
      this.customersService.findOneByUserId(userId),
    ]);

    if (!regularPayment || regularPayment.customerId !== customer.id) {
      throw new NotFoundException(`Regular payment with id ${id} not found`);
    }

    return RegularPaymentEntity.fromPlainObj(regularPayment);
  }

  async create(
    createRegularPaymentDto: RegularPaymentCreateDto,
    userId: string,
  ): Promise<boolean> {
    const customer = await this.customersService.findOneByUserId(userId);

    return await this.regularPaymentsRepository.create({
      ...createRegularPaymentDto,
      customerId: customer.id,
    });
  }

  async update(
    id: string,
    updateRegularPaymentDto: RegularPaymentUpdateDto,
    userId: string,
  ): Promise<boolean> {
    await this.findOneAsCustomer(id, userId); // check if regular payment exists

    return await this.regularPaymentsRepository.update(id, updateRegularPaymentDto);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await this.findOneAsCustomer(id, userId); // check if regular payment exists

    return await this.regularPaymentsRepository.delete(id);
  }

  async applyRegularPayments(_monthYear: string): Promise<void> {
    // TODO Fetch all regular payments in loop
    const regularPayments = await this.regularPaymentsRepository.findAll();

    const expensesToCreate: IExpenseCreateInput[] = regularPayments.map(
      regularPayment => ({
        customerId: regularPayment.customerId,
        date: regularPayment.dateOfCharge.toISOString(),
        amount: regularPayment.amount,
        category: regularPayment.category as ExpenseCategory,
      }),
    );

    // TODO in future use msg broker to create expenses instead of a transaction
    await this.expensesService.createManyViaTransaction(expensesToCreate);
  }
}
