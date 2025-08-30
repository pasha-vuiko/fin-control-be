import { IPagePaginationInput } from '@shared/interfaces/page-pagination-input.interface';
import { IPagePaginationOutput } from '@shared/interfaces/page-pagination-output.interface';

import { IExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';
import { IExpenseFromDb } from '@api/domain/expenses/interfaces/expense-from-db.interface';
import { IExpenseUpdateInput } from '@api/domain/expenses/interfaces/expense-update-input.interface';

export interface IExpensesRepository {
  findMany(
    pagination: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpenseFromDb>>;

  findManyByCustomer(
    customerId: string,
    pagination?: IPagePaginationInput,
  ): Promise<IPagePaginationOutput<IExpenseFromDb>>;

  findOne(id: string): Promise<IExpenseFromDb | null>;

  createOne(createExpenseInputs: IExpenseCreateInput): Promise<IExpenseFromDb>;

  createMany(createExpenseInputs: IExpenseCreateInput[]): Promise<IExpenseFromDb[]>;

  update(id: string, data: IExpenseUpdateInput): Promise<IExpenseFromDb | null>;

  delete(id: string): Promise<IExpenseFromDb | null>;
}
