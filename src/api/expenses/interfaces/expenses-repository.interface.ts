import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';
import { IExpenseUpdateInput } from '@api/expenses/interfaces/expense-update-input.interface';
import { IExpense } from '@api/expenses/interfaces/expense.interface';

export interface IExpensesRepository {
  findMany(pagination: IPagePaginationInput): Promise<IPagePaginationOutput<IExpense>>;

  findManyByCustomer(
    customerId: string,
    pagination?: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpense>>;

  findOne(id: string): Promise<IExpense | null>;

  createMany(createExpenseInputs: IExpenseCreateInput[]): Promise<IExpense[]>;

  update(id: string, data: IExpenseUpdateInput): Promise<IExpense>;

  delete(id: string): Promise<IExpense>;
}
