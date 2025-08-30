import { Expense as PrismaExpense } from '@prisma-definitions/client/client';
import { eq } from 'drizzle-orm';

import { Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { CatchErrors } from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';
import { PrismaService } from '@shared/modules/prisma/prisma.service';
import { getPrismaPaginationParams } from '@shared/modules/prisma/utils/get-prisma-pagination-params';
import { handlePrismaError } from '@shared/modules/prisma/utils/handle-prisma-error';
import { omitObjKeys } from '@shared/utils/omit-obj-keys.util';

import { ExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';
import { ExpenseUpdateInput } from '@api/domain/expenses/interfaces/expense-update-input.interface';
import { IExpense } from '@api/domain/expenses/interfaces/expense.interface';
import { IExpensesRepository } from '@api/domain/expenses/interfaces/expenses-repository.interface';

import { Expense } from '../../../../../prisma/drizzle/schema';

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  @CatchErrors(handlePrismaError)
  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>> {
    const { take, skip } = getPrismaPaginationParams(pagination);

    return await this.prismaService.$drizzle
      .transaction(async tx => {
        const expenses = await tx.select().from(Expense).limit(take).offset(skip);
        const total = await tx.$count(Expense);

        return { expenses, total };
      })
      .then(({ expenses, total }) => ({
        items: this.mapExpensesFromPrismaToExpenses(expenses),
        total,
      }));
  }

  @CatchErrors(handlePrismaError)
  async findManyByCustomer(
    customerId: string,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>> {
    const { take, skip } = getPrismaPaginationParams(pagination);

    return await this.prismaService.$drizzle
      .transaction(async tx => {
        const expenses = await tx
          .select()
          .from(Expense)
          .where(eq(Expense.customerId, customerId))
          .limit(take)
          .offset(skip);
        const total = await tx.$count(Expense, eq(Expense.customerId, customerId));

        return { expenses, total };
      })
      .then(({ expenses, total }) => ({
        items: this.mapExpensesFromPrismaToExpenses(expenses),
        total,
      }));
  }

  @CatchErrors(handlePrismaError)
  async findOne(id: string): Promise<IExpense | null> {
    const [foundExpense] = await this.prismaService.$drizzle
      .select()
      .from(Expense)
      .where(eq(Expense.id, id));

    if (!foundExpense) {
      return null;
    }

    return this.mapExpenseFromPrismaToExpense(foundExpense);
  }

  @CatchErrors(handlePrismaError)
  async createOne(createExpenseInputs: ExpenseCreateInput): Promise<IExpense> {
    const { amount, date } = createExpenseInputs;

    return await this.prismaService.$drizzle
      .insert(Expense)
      .values({
        ...createExpenseInputs,
        id: crypto.randomUUID(),
        amount,
        date: new Date(date),
      })
      .returning()
      .then(([createdExpense]) => this.mapExpenseFromPrismaToExpense(createdExpense!));
  }

  @CatchErrors(handlePrismaError)
  async createMany(createExpenseInputs: ExpenseCreateInput[]): Promise<IExpense[]> {
    const expensesToCreate = createExpenseInputs.map(expenseToCreate => {
      const { amount, date } = expenseToCreate;

      return {
        ...expenseToCreate,
        id: crypto.randomUUID(),
        amount,
        date: new Date(date),
      };
    });

    return await this.prismaService.$drizzle
      .insert(Expense)
      .values(expensesToCreate)
      .returning()
      .then(createdExpenses => this.mapExpensesFromPrismaToExpenses(createdExpenses));
  }

  @CatchErrors(handlePrismaError)
  async update(id: string, data: ExpenseUpdateInput): Promise<IExpense | null> {
    const dataWithoutCustomerId = omitObjKeys(data, 'customerId');

    const { amount, date } = dataWithoutCustomerId;

    const expenseToUpdate = {
      ...dataWithoutCustomerId,
      amount: amount ? amount.toString() : undefined,
      date: date ? new Date(date) : undefined,
    };

    return await this.prismaService.$drizzle
      .update(Expense)
      .set(expenseToUpdate)
      .where(eq(Expense.id, id))
      .returning()
      .then(([updatedExpense]) =>
        updatedExpense ? this.mapExpenseFromPrismaToExpense(updatedExpense) : null,
      );
  }

  @CatchErrors(handlePrismaError)
  async delete(id: string): Promise<IExpense | null> {
    return await this.prismaService.$drizzle
      .delete(Expense)
      .where(eq(Expense.id, id))
      .returning()
      .then(([deletedExpense]) =>
        deletedExpense ? this.mapExpenseFromPrismaToExpense(deletedExpense) : null,
      );
  }

  private mapExpensesFromPrismaToExpenses(expenses: IExpenseFromDb[]): IExpense[] {
    return expenses.map(expense => this.mapExpenseFromPrismaToExpense(expense));
  }

  private mapExpenseFromPrismaToExpense(expense: IExpenseFromDb): IExpense {
    return {
      id: expense.id,
      customerId: expense.customerId,
      date: expense.date,
      amount: Number(expense.amount),
      category: expense.category,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}

interface IExpenseFromDb extends Omit<PrismaExpense, 'amount'> {
  amount: string;
}
