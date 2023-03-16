import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesRepository } from '@api/expenses/repositories/expenses.repository';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { UpdateExpenseDto } from '@api/expenses/dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(ExpensesRepository) private expensesRepository: IExpensesRepository,
  ) {}

  async findMany(): Promise<ExpenseEntity[]> {
    return this.expensesRepository.findMany();
  }

  async findOne(id: string): Promise<ExpenseEntity> {
    const foundExpense = await this.expensesRepository.findOne(id);

    if (!foundExpense) {
      throw new NotFoundException(`expense with ${id} is not found`);
    }

    return foundExpense;
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    customerId: string,
  ): Promise<ExpenseEntity> {
    return this.expensesRepository.update(id, {
      ...updateExpenseDto,
      customerId,
    });
  }
}
