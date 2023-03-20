import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';
import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';
import { IUpdateExpenseInput } from '@api/expenses/interfaces/update-expense-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { Expense, Prisma } from '../../../../prisma/client';
import { IPagination } from '@shared/interfaces/pagination.interface';
import { mergePaginationWithDefault } from '@shared/utils/merge-pagination-with-default';
import { omitObj } from '@shared/utils/omit-obj.util';
import SortOrder = Prisma.SortOrder;

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
  constructor(private prismaService: PrismaService) {}

  async findMany(pagination?: IPagination): Promise<IExpense[]> {
    const { skip, take } = mergePaginationWithDefault(pagination);
    const foundExpenses = await this.prismaService.expense.findMany({ skip, take });

    return foundExpenses.map(expense => this.mapExpenseFromPrismaToExpense(expense));
  }

  async findManyByCustomer(
    customerId: string,
    pagination?: IPagination,
  ): Promise<IExpense[]> {
    const { skip, take } = mergePaginationWithDefault(pagination);

    const foundExpenses = await this.prismaService.expense.findMany({
      where: {
        customerId,
      },
      skip,
      take,
    });

    return foundExpenses.map(expense => this.mapExpenseFromPrismaToExpense(expense));
  }

  async findOne(id: string): Promise<IExpense | null> {
    const foundExpense = await this.prismaService.expense.findUnique({ where: { id } });

    if (!foundExpense) {
      return null;
    }

    return this.mapExpenseFromPrismaToExpense(foundExpense);
  }

  async createMany(
    createExpenseInputs: ICreateExpenseInput[],
    customerId: string,
  ): Promise<IExpense[]> {
    const { count } = await this.prismaService.expense.createMany({
      data: createExpenseInputs,
    });

    const foundCreatedExpenses = await this.prismaService.expense.findMany({
      where: { customerId },
      orderBy: {
        updatedAt: SortOrder.desc,
      },
      take: count,
    });

    return foundCreatedExpenses.map(expense =>
      this.mapExpenseFromPrismaToExpense(expense),
    );
  }

  async update(id: string, data: IUpdateExpenseInput): Promise<IExpense> {
    const dataWithoutCustomerId = omitObj(data, 'customerId');
    const updatedExpense = await this.prismaService.expense.update({
      data: dataWithoutCustomerId,
      where: { id },
    });

    return this.mapExpenseFromPrismaToExpense(updatedExpense);
  }

  async delete(id: string): Promise<IExpense> {
    const deletedExpense = await this.prismaService.expense.delete({ where: { id } });

    return this.mapExpenseFromPrismaToExpense(deletedExpense);
  }

  private mapExpenseFromPrismaToExpense(expense: Expense): IExpense {
    return {
      id: expense.id,
      customerId: expense.customerId,
      date: expense.date,
      amount: expense.amount.toNumber(),
      type: expense.type,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
