import { Inject, Injectable } from '@nestjs/common';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';

import { CustomersService } from '@api/customers/services/customers.service';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { ExpenseIsNotFoundException } from '@api/expenses/exceptions/exception-classes';
import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { ExpenseCreateDto } from '../dto/expense-create.dto';
import { ExpenseUpdateDto } from '../dto/expense-update.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(ExpensesRepository) private expensesRepository: IExpensesRepository,
    private customersService: CustomersService,
  ) {}

  async findManyAsCustomer(
    userId: string,
    pagination?: PagePaginationDto,
  ): Promise<PagePaginationOutputEntity<ExpenseEntity>> {
    const { id } = await this.customersService.findOneByUserId(userId);

    const { total, items } = await this.expensesRepository.findManyByCustomer(
      id,
      pagination,
    );

    return new PagePaginationOutputEntity({
      items: items.map(ExpenseEntity.fromExpenseObj),
      total,
    });
  }

  async findManyAsAdmin(
    pagination: PagePaginationDto,
  ): Promise<PagePaginationOutputEntity<ExpenseEntity>> {
    const { items, total } = await this.expensesRepository.findMany(pagination);

    return new PagePaginationOutputEntity({
      items: items.map(ExpenseEntity.fromExpenseObj),
      total,
    });
  }

  async findOneAsCustomer(id: string, userId: string): Promise<ExpenseEntity> {
    const [foundExpense, customer] = await Promise.all([
      this.expensesRepository.findOne(id),
      this.customersService.findOneByUserId(userId),
    ]);

    if (!foundExpense || foundExpense.customerId !== customer.id) {
      throw new ExpenseIsNotFoundException();
    }

    return ExpenseEntity.fromExpenseObj(foundExpense);
  }

  async findOneAsAdmin(id: string): Promise<ExpenseEntity> {
    const foundExpense = await this.expensesRepository.findOne(id);

    if (!foundExpense) {
      throw new ExpenseIsNotFoundException();
    }

    return ExpenseEntity.fromExpenseObj(foundExpense);
  }

  async createMany(
    expensesToCreate: ExpenseCreateDto[],
    userId: string,
  ): Promise<ExpenseEntity[]> {
    const customer = await this.customersService.findOneByUserId(userId);
    const createExpensesDataWithCustomerId: IExpenseCreateInput[] = expensesToCreate.map(
      dto => ({
        ...dto,
        customerId: customer.id,
      }),
    );

    return await this.expensesRepository
      .createMany(createExpensesDataWithCustomerId, customer.id)
      .then(expenses => expenses.map(ExpenseEntity.fromExpenseObj));
  }

  async createManyViaTransaction(
    expensesToCreate: IExpenseCreateInput[],
  ): Promise<ExpenseEntity[]> {
    return await this.expensesRepository
      .createManyViaTransaction(expensesToCreate)
      .then(expenses => expenses.map(ExpenseEntity.fromExpenseObj));
  }

  async update(
    id: string,
    updateExpenseDto: ExpenseUpdateDto,
    userId: string,
  ): Promise<ExpenseEntity> {
    const [customer] = await Promise.all([
      this.customersService.findOneByUserId(userId),
      this.findOneAsCustomer(id, userId),
    ]);

    return await this.expensesRepository
      .update(id, {
        ...updateExpenseDto,
        customerId: customer.id,
      })
      .then(ExpenseEntity.fromExpenseObj);
  }

  async delete(id: string, userId: string): Promise<ExpenseEntity> {
    const [customer, expense] = await Promise.all([
      this.customersService.findOneByUserId(userId),
      this.findOneAsCustomer(id, userId),
    ]);

    const expenseDoesBelongsToCustomer = expense.customerId === customer.id;

    if (!expenseDoesBelongsToCustomer) {
      throw new ExpenseIsNotFoundException();
    }

    return await this.expensesRepository.delete(id).then(ExpenseEntity.fromExpenseObj);
  }
}
