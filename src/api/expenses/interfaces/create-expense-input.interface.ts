import { Prisma } from '../../../../prisma/client';
import ExpenseCreateInput = Prisma.ExpenseCreateInput;

export interface ICreateExpenseInput extends Omit<ExpenseCreateInput, 'id' | 'customer'> {
  customerId: string;
}
