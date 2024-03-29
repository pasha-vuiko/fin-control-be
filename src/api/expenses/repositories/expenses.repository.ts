import { Expense, Prisma } from '@prisma/client';

import { Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { Catch } from '@shared/modules/error/decorators/catch.decorator';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { getPrismaPaginationParams } from '@shared/modules/prisma/utils/get-prisma-pagination-params';
import { handlePrismaError } from '@shared/modules/prisma/utils/handle-prisma-error';
import { omitObj } from '@shared/utils/omit-obj.util';

import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpenseUpdateInput } from '@api/expenses/interfaces/expense-update-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';

import SortOrder = Prisma.SortOrder;

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
  constructor(private prismaService: PrismaService) {}

  @Catch(handlePrismaError)
  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>> {
    const { take, skip } = getPrismaPaginationParams(pagination);

    return await this.prismaService
      .$transaction([
        this.prismaService.expense.findMany({ skip, take }),
        this.prismaService.expense.count(),
      ])
      .then(([expenses, total]) => ({
        items: this.mapExpensesFromPrismaToExpenses(expenses),
        total,
      }));
  }

  @Catch(handlePrismaError)
  async findManyByCustomer(
    customerId: string,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>> {
    const { take, skip } = getPrismaPaginationParams(pagination);

    return await this.prismaService
      .$transaction([
        this.prismaService.expense.findMany({
          where: { customerId },
          skip,
          take,
        }),
        this.prismaService.expense.count(),
      ])
      .then(([expenses, total]) => ({
        items: this.mapExpensesFromPrismaToExpenses(expenses),
        total,
      }));
  }

  @Catch(handlePrismaError)
  async findOne(id: string): Promise<IExpense | null> {
    const foundExpense = await this.prismaService.expense.findUnique({ where: { id } });

    if (!foundExpense) {
      return null;
    }

    return this.mapExpenseFromPrismaToExpense(foundExpense);
  }

  @Catch(handlePrismaError)
  async createMany(
    createExpenseInputs: IExpenseCreateInput[],
    customerId: string,
  ): Promise<IExpense[]> {
    const { count } = await this.prismaService.expense.createMany({
      data: createExpenseInputs,
    });

    return await this.prismaService.expense
      .findMany({
        where: { customerId },
        orderBy: {
          createdAt: SortOrder.desc,
        },
        take: count,
      })
      .then(createdExpenses => this.mapExpensesFromPrismaToExpenses(createdExpenses));
  }

  @Catch(handlePrismaError)
  async createManyViaTransaction(
    createExpenseInputs: IExpenseCreateInput[],
  ): Promise<IExpense[]> {
    return await this.prismaService
      .$transaction(async tx => {
        const { count } = await tx.expense.createMany({
          data: createExpenseInputs,
        });

        return await tx.expense.findMany({
          orderBy: {
            createdAt: SortOrder.desc,
          },
          take: count,
        });
      })
      .then(createdExpenses => this.mapExpensesFromPrismaToExpenses(createdExpenses));
  }

  @Catch(handlePrismaError)
  async update(id: string, data: IExpenseUpdateInput): Promise<IExpense> {
    const dataWithoutCustomerId = omitObj(data, 'customerId');

    return await this.prismaService.expense
      .update({
        data: dataWithoutCustomerId,
        where: { id },
      })
      .then(updatedExpense => this.mapExpenseFromPrismaToExpense(updatedExpense));
  }

  @Catch(handlePrismaError)
  async delete(id: string): Promise<IExpense> {
    return await this.prismaService.expense
      .delete({ where: { id } })
      .then(deletedExpense => this.mapExpenseFromPrismaToExpense(deletedExpense));
  }

  private mapExpensesFromPrismaToExpenses(expenses: Expense[]): IExpense[] {
    return expenses.map(expense => this.mapExpenseFromPrismaToExpense(expense));
  }

  private mapExpenseFromPrismaToExpense(expense: Expense): IExpense {
    return {
      id: expense.id,
      customerId: expense.customerId,
      date: expense.date,
      amount: expense.amount.toNumber(),
      category: expense.category,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
