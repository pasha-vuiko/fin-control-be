import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';

export interface IExpenseUpdateInput extends Partial<IExpenseCreateInput> {}
