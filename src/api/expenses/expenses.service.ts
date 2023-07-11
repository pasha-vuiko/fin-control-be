import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PagePaginationDto } from '@shared/dto/page-pagination.dto';
import { PagePaginationOutputEntity } from '@shared/entities/page-pagination-output.entity';

import { CustomersService } from '@api/customers/customers.service';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';

import { ExpenseCreateDto } from './dto/expense-create.dto';
import { ExpenseUpdateDto } from './dto/expense-update.dto';

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

    return this.expensesRepository.findManyByCustomer(id, pagination);
  }

  async findManyAsAdmin(
    pagination: PagePaginationDto,
  ): Promise<PagePaginationOutputEntity<ExpenseEntity>> {
    return this.expensesRepository.findMany(pagination);
  }

  async findOneAsCustomer(id: string, userId: string): Promise<ExpenseEntity> {
    const [foundExpense, customer] = await Promise.all([
      this.expensesRepository.findOne(id),
      this.customersService.findOneByUserId(userId),
    ]);

    if (!foundExpense || foundExpense.customerId === customer.id) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return foundExpense;
  }

  async findOneAsAdmin(id: string): Promise<ExpenseEntity> {
    const foundExpense = await this.expensesRepository.findOne(id);

    if (!foundExpense) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return foundExpense;
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

    return this.expensesRepository.createMany(
      createExpensesDataWithCustomerId,
      customer.id,
    );
  }

  async createManyViaTransaction(
    expensesToCreate: IExpenseCreateInput[],
  ): Promise<ExpenseEntity[]> {
    return this.expensesRepository.createManyViaTransaction(expensesToCreate);
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

    return this.expensesRepository.update(id, {
      ...updateExpenseDto,
      customerId: customer.id,
    });
  }

  async delete(id: string, userId: string): Promise<ExpenseEntity> {
    const [customer, expense] = await Promise.all([
      this.customersService.findOneByUserId(userId),
      this.findOneAsCustomer(id, userId),
    ]);

    const expenseDoesBelongsToCustomer = expense.customerId === customer.id;

    if (!expenseDoesBelongsToCustomer) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return this.expensesRepository.delete(id);
  }
}
