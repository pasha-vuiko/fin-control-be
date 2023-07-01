import { IPagination } from '@shared/interfaces/pagination.interface';

import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpenseUpdateInput } from '@api/expenses/interfaces/expense-update-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';

export interface IExpensesRepository {
  findMany(pagination?: IPagination): Promise<IExpense[]>;

  findManyByCustomer(customerId: string, pagination?: IPagination): Promise<IExpense[]>;

  findOne(id: string): Promise<IExpense | null>;

  createMany(
    createExpenseInputs: IExpenseCreateInput[],
    customerId: string,
  ): Promise<IExpense[]>;

  createManyViaTransaction(
    createExpenseInputs: IExpenseCreateInput[],
  ): Promise<IExpense[]>;

  update(id: string, data: IExpenseUpdateInput): Promise<IExpense>;

  delete(id: string): Promise<IExpense>;
}
