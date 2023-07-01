import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IPagination } from '@shared/interfaces/pagination.interface';

import { CustomersService } from '@api/customers/customers.service';
import { ExpensesService } from '@api/expenses/expenses.service';
import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { RegularPaymentEntity } from '@api/regular-payments/entities/regular-payment.entity';
import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';
import { IRegularPaymentsRepository } from '@api/regular-payments/interfaces/regular-payments-repository.interface';
import { RegularPaymentsRepository } from '@api/regular-payments/repositories/regular-payments.repository';

import { RegularPaymentCreateDto } from './dto/regular-payment-create.dto';
import { RegularPaymentUpdateDto } from './dto/regular-payment-update.dto';

@Injectable()
export class RegularPaymentsService {
  constructor(
    @Inject(RegularPaymentsRepository)
    private regularPaymentsRepository: IRegularPaymentsRepository,
    private customersService: CustomersService,
    private expensesService: ExpensesService,
  ) {}

  findManyAsAdmin(pagination?: IPagination): Promise<RegularPaymentEntity[]> {
    return this.regularPaymentsRepository.findMany({}, pagination);
  }

  async findManyAsCustomer(
    userId: string,
    pagination?: IPagination,
  ): Promise<RegularPaymentEntity[]> {
    const customer = await this.customersService.findOneByUserId(userId);

    return this.regularPaymentsRepository.findMany(
      { customerId: customer.id },
      pagination,
    );
  }

  async findOneAsAdmin(id: string): Promise<RegularPaymentEntity> {
    const regularPayment = await this.regularPaymentsRepository.findOne(id);

    if (!regularPayment) {
      throw new NotFoundException(`Regular payment with id ${id} not found`);
    }

    return regularPayment;
  }

  async findOneAsCustomer(id: string, userId: string): Promise<RegularPaymentEntity> {
    const [regularPayment, customer] = await Promise.all([
      this.regularPaymentsRepository.findOne(id),
      this.customersService.findOneByUserId(userId),
    ]);

    if (!regularPayment || regularPayment.customerId !== customer.id) {
      throw new NotFoundException(`Regular payment with id ${id} not found`);
    }

    return regularPayment;
  }

  async create(
    createRegularPaymentDto: RegularPaymentCreateDto,
    userId: string,
  ): Promise<RegularPaymentEntity> {
    const customer = await this.customersService.findOneByUserId(userId);

    return this.regularPaymentsRepository.create({
      ...createRegularPaymentDto,
      customerId: customer.id,
    });
  }

  async update(
    id: string,
    updateRegularPaymentDto: RegularPaymentUpdateDto,
    userId: string,
  ): Promise<IRegularPayment> {
    await this.findOneAsCustomer(id, userId); // check if regular payment exists

    return this.regularPaymentsRepository.update(id, updateRegularPaymentDto);
  }

  async delete(id: string, userId: string): Promise<IRegularPayment> {
    await this.findOneAsCustomer(id, userId); // check if regular payment exists

    return this.regularPaymentsRepository.delete(id);
  }

  async applyRegularPayments(monthYear: string): Promise<void> {
    const regularPayments = await this.regularPaymentsRepository.findMany({});

    const expensesToCreate: IExpenseCreateInput[] = regularPayments.map(
      regularPayment => ({
        customerId: regularPayment.customerId,
        date: regularPayment.dateOfCharge,
        amount: regularPayment.amount,
        category: regularPayment.category,
      }),
    );

    // TODO in future use msg broker to create expenses instead of a transaction
    await this.expensesService.createManyViaTransaction(expensesToCreate);
  }
}