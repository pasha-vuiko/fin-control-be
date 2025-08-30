import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { ExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';
import { ExpenseUpdateInput } from '@api/domain/expenses/interfaces/expense-update-input.interface';
import { IExpense } from '@api/domain/expenses/interfaces/expense.interface';

export interface IExpensesRepository {
  findMany(pagination: IPagePaginationInput): Promise<IPagePaginationOutput<IExpense>>;

  findManyByCustomer(
    customerId: string,
    pagination?: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>>;

  findOne(id: string): Promise<IExpense | null>;

  createOne(createExpenseInputs: ExpenseCreateInput): Promise<IExpense>;

  createMany(createExpenseInputs: ExpenseCreateInput[]): Promise<IExpense[]>;

  update(id: string, data: ExpenseUpdateInput): Promise<IExpense | null>;

  delete(id: string): Promise<IExpense | null>;
}
