import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';
import { IUpdateExpenseInput } from '@api/expenses/interfaces/update-expense-input.interface';

export interface IExpensesRepository {
  findMany(): Promise<IExpense[]>;

  findManyByCustomer(customerId: string): Promise<IExpense[]>;

  findOne(id: string): Promise<IExpense | null>;

  create(data: ICreateExpenseInput): Promise<IExpense>;

  update(id: string, data: IUpdateExpenseInput): Promise<IExpense>;

  delete(id: string): Promise<IExpense>;
}
