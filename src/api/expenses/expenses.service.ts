import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { CustomersService } from '@api/customers/customers.service';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(ExpensesRepository) private expensesRepository: IExpensesRepository,
    private customersService: CustomersService,
  ) {}

  async findMany(userId: string, userRoles: Roles[]): Promise<ExpenseEntity[]> {
    const { id } = await this.customersService.findOneByUserId(userId);

    // TODO Move to AdminModule
    if (userRoles.includes(Roles.ADMIN)) {
      return this.expensesRepository.findMany();
    }

    return this.expensesRepository.findManyByCustomer(id);
  }

  async findOne(id: string, userId: string, userRoles: Roles[]): Promise<ExpenseEntity> {
    const [foundExpense, customer] = await Promise.all([
      this.expensesRepository.findOne(id),
      this.customersService.findOneByUserId(userId),
    ]);

    if (!foundExpense) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    // TODO Move to AdminModule
    const expenseDoesBelongsToCustomer = foundExpense.customerId === customer.id;
    const isAdmin = userRoles.includes(Roles.ADMIN);

    if (!isAdmin || !expenseDoesBelongsToCustomer) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return foundExpense;
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<ExpenseEntity> {
    const customer = await this.customersService.findOneByUserId(userId);

    return this.expensesRepository.create({
      ...createExpenseDto,
      customerId: customer.id,
    });
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    user: IUser,
  ): Promise<ExpenseEntity> {
    const [customer, expense] = await Promise.all([
      this.customersService.findOneByUserId(user.id),
      this.findOne(id, user.id, user.roles),
    ]);

    // TODO Move to AdminModule
    const isAdmin = user.roles.includes(Roles.ADMIN);
    const expenseDoesBelongsToCustomer = expense.customerId === customer.id;

    if (!isAdmin || !expenseDoesBelongsToCustomer) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return this.expensesRepository.update(id, {
      ...updateExpenseDto,
      customerId: customer.id,
    });
  }

  async delete(id: string, userId: string, userRoles: Roles[]): Promise<ExpenseEntity> {
    const [customer, expense] = await Promise.all([
      this.customersService.findOneByUserId(userId),
      this.findOne(id, userId, userRoles),
    ]);

    // TODO Move to AdminModule
    const isAdmin = userRoles.includes(Roles.ADMIN);
    const expenseDoesBelongsToCustomer = expense.customerId === customer.id;

    if (!isAdmin || !expenseDoesBelongsToCustomer) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return this.expensesRepository.delete(id);
  }
}
