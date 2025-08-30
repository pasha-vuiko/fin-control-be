import { ExpenseCreateInput } from '@api/domain/expenses/interfaces/expense-create-input.interface';

export interface ExpenseUpdateInput extends Partial<ExpenseCreateInput> {}
