import { IExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';

export interface IExpenseUpdateInput extends Partial<IExpenseCreateInput> {}
