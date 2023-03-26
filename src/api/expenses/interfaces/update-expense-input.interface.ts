import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';

export interface IUpdateExpenseInput extends Partial<ICreateExpenseInput> {}
