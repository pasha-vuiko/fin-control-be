import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { ExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';
import { ExpenseFromDb } from '@api/domain/expenses/interfaces/expense-from-db.interface';
import { ExpenseUpdateInput } from '@api/domain/expenses/interfaces/expense-update-input.interface';

export interface IExpensesRepository {
  findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ExpenseFromDb>>;

  findManyByCustomer(
    customerId: string,
    pagination?: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<ExpenseFromDb>>;

  findOne(id: string): Promise<ExpenseFromDb | null>;

  createOne(createExpenseInputs: ExpenseCreateInput): Promise<ExpenseFromDb>;

  createMany(createExpenseInputs: ExpenseCreateInput[]): Promise<ExpenseFromDb[]>;

  update(id: string, data: ExpenseUpdateInput): Promise<ExpenseFromDb | null>;

  delete(id: string): Promise<ExpenseFromDb | null>;
}
