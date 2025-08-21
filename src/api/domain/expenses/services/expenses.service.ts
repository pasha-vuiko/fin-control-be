import { Inject, Injectable } from '@nestjs/common';

import { BindContext } from '@shared/decorators/bind-context.decorator';
import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';

import { CustomersService } from '@api/domain/customers/services/customers.service';
import { ExpenseEntity } from '@api/domain/expenses/entities/expense.entity';
import { ExpenseIsNotFoundException } from '@api/domain/expenses/exceptions/exception-classes';
import { IExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';
import { IExpense } from '@api/domain/expenses/interfaces/expense.interface';
import { IExpensesRepository } from '@api/domain/expenses/interfaces/expenses-repository.interface';
import { ExpensesRepository } from '@api/domain/expenses/repositories/expenses.repository';

import { ExpenseCreateDto } from '../dto/expense-create.dto';
import { ExpenseUpdateDto } from '../dto/expense-update.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(ExpensesRepository) private readonly expensesRepository: IExpensesRepository,
    private readonly customersService: CustomersService,
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
    return await this.expensesRepository
      .findOne(id)
      .then(this.throwNotFoundIfExpenseNotDefined)
      .then(ExpenseEntity.fromExpenseObj);
  }

  async createOne(
    expenseToCreate: ExpenseCreateDto,
    customerId: string,
  ): Promise<ExpenseEntity> {
    const createExpensesDataWithCustomerId: IExpenseCreateInput = {
      ...expenseToCreate,
      customerId,
      amount: expenseToCreate.amount.toString(),
      date: new Date(expenseToCreate.date),
    };

    return await this.expensesRepository
      .createOne(createExpensesDataWithCustomerId)
      .then(ExpenseEntity.fromExpenseObj);
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
        amount: dto.amount.toString(),
        date: new Date(dto.date),
      }),
    );

    return await this.expensesRepository
      .createMany(createExpensesDataWithCustomerId)
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
        amount: updateExpenseDto.amount?.toString(),
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
      })
      .then(this.throwNotFoundIfExpenseNotDefined)
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

    return await this.expensesRepository
      .delete(id)
      .then(this.throwNotFoundIfExpenseNotDefined)
      .then(ExpenseEntity.fromExpenseObj);
  }

  @BindContext()
  private throwNotFoundIfExpenseNotDefined(expense: IExpense | null): IExpense {
    if (!expense) {
      throw new ExpenseIsNotFoundException();
    }

    return expense;
  }
}
