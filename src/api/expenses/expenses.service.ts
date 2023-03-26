import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { CustomersService } from '@api/customers/customers.service';
import { PaginationDto } from '@shared/dto/pagination.dto';
import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(ExpensesRepository) private expensesRepository: IExpensesRepository,
    private customersService: CustomersService,
  ) {}

  async findManyAsCustomer(
    userId: string,
    pagination?: PaginationDto,
  ): Promise<ExpenseEntity[]> {
    const { id } = await this.customersService.findOneByUserId(userId);

    return this.expensesRepository.findManyByCustomer(id, pagination);
  }

  async findManyAsAdmin(pagination?: PaginationDto): Promise<ExpenseEntity[]> {
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
    createExpenseDTOs: CreateExpenseDto[],
    userId: string,
  ): Promise<ExpenseEntity[]> {
    const customer = await this.customersService.findOneByUserId(userId);
    const createExpensesDataWithCustomerId: ICreateExpenseInput[] = createExpenseDTOs.map(
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

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    userId: string,
  ): Promise<ExpenseEntity> {
    const [customer, expense] = await Promise.all([
      this.customersService.findOneByUserId(userId),
      this.findOneAsCustomer(id, userId),
    ]);

    const expenseDoesBelongsToCustomer = expense.customerId === customer.id;

    if (!expenseDoesBelongsToCustomer) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

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
