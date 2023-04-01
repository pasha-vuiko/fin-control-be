import { IExpense } from '@api/expenses/interfaces/expense.interface';
import { ExpenseCategory } from '../../../../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ExpenseEntity implements IExpense {
  id: string;

  customerId: string;

  date: Date;

  amount: number;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  createdAt: Date;

  updatedAt: Date;
}
