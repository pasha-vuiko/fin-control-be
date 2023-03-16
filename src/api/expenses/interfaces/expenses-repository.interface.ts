import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';
import { IUpdateExpenseInput } from '@api/expenses/interfaces/update-expense-input.interface';
import { IPagination } from '@shared/interfaces/pagination.interface';

export interface IExpensesRepository {
  findMany(pagination?: IPagination): Promise<IExpense[]>;

  findManyByCustomer(customerId: string, pagination?: IPagination): Promise<IExpense[]>;

  findOne(id: string): Promise<IExpense | null>;

  create(data: ICreateExpenseInput): Promise<IExpense>;

  update(id: string, data: IUpdateExpenseInput): Promise<IExpense>;

  delete(id: string): Promise<IExpense>;
}