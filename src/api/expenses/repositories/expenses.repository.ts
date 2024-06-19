import crypto from 'node:crypto';

import { count, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { Inject, Injectable } from '@nestjs/common';

import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';
import { DRIZZLE_CLIENT } from '@shared/modules/drizzle/providers/drizzle-client.provider';
import { deleteUndefinedFieldsFromObj } from '@shared/utils/delete-undefined-fields-from-obj.util';
import { getDbPaginationParams } from '@shared/utils/get-db-pagination-params';
import { omitObjKeys } from '@shared/utils/omit-obj-keys.util';

import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';
import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpenseUpdateInput } from '@api/expenses/interfaces/expense-update-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { IExpensesRepository } from '@api/expenses/interfaces/expenses-repository.interface';

import * as schema from '../../../drizzle/schema';
import { Expense } from '../../../drizzle/schema';

@Injectable()
export class ExpensesRepository implements IExpensesRepository {
  constructor(
    @Inject(DRIZZLE_CLIENT) private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>> {
    const { take, skip } = getDbPaginationParams(pagination);

    return await this.drizzle
      .transaction(
        async tx => {
          const expenses = await tx.select().from(Expense).limit(take).offset(skip);
          const [{ value: total }] = await tx.select({ value: count() }).from(Expense);

          return { expenses, total };
        },
        { isolationLevel: 'repeatable read' },
      )
      .then(({ expenses, total }) => ({
        items: this.mapExpensesFromDrizzleToExpenses(expenses),
        total,
      }));
  }

  async findManyByCustomer(
    customerId: string,
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>> {
    const { take, skip } = getDbPaginationParams(pagination);

    return await this.drizzle
      .transaction(
        async tx => {
          const expenses = await tx
            .select()
            .from(Expense)
            .limit(take)
            .offset(skip)
            .where(eq(Expense.customerId, customerId));
          const [{ value: total }] = await tx
            .select({ value: count() })
            .from(Expense)
            .where(eq(Expense.customerId, customerId));

          return { expenses, total };
        },
        { isolationLevel: 'repeatable read' },
      )
      .then(({ expenses, total }) => ({
        items: this.mapExpensesFromDrizzleToExpenses(expenses),
        total,
      }));
  }

  async findOne(id: string): Promise<IExpense | null> {
    const [foundExpense] = await this.drizzle
      .select()
      .from(Expense)
      .where(eq(Expense.id, id));

    if (!foundExpense) {
      return null;
    }

    return this.mapExpenseFromDrizzleToExpense(foundExpense);
  }

  async createMany(createExpenseInputs: IExpenseCreateInput[]): Promise<number> {
    const { count } = await this.drizzle.insert(Expense).values(
      createExpenseInputs.map(input => {
        return {
          ...input,
          id: crypto.randomUUID(),
          amount: input.amount.toString(),
        };
      }),
    );

    return count;
  }

  async update(id: string, data: IExpenseUpdateInput): Promise<boolean> {
    const dataWithoutCustomerId = omitObjKeys(data, 'customerId');
    const { amount, date } = dataWithoutCustomerId;

    await this.drizzle
      .update(Expense)
      .set(
        deleteUndefinedFieldsFromObj({
          ...dataWithoutCustomerId,
          amount: amount?.toString(),
          date: date?.toString(),
        }),
      )
      .where(eq(Expense.id, id));

    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.drizzle.delete(Expense).where(eq(Expense.id, id));

    return true;
  }

  private mapExpensesFromDrizzleToExpenses(expenses: IDrizzleExpense[]): IExpense[] {
    return expenses.map(expense => this.mapExpenseFromDrizzleToExpense(expense));
  }

  private mapExpenseFromDrizzleToExpense(expense: IDrizzleExpense): IExpense {
    return {
      id: expense.id,
      customerId: expense.customerId,
      date: new Date(expense.date),
      amount: parseFloat(expense.amount),
      category: expense.category as ExpenseCategory,
      createdAt: new Date(expense.createdAt),
      updatedAt: new Date(expense.updatedAt),
    };
  }
}

interface IDrizzleExpense {
  id: string;
  customerId: string;
  date: string;
  amount: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}
