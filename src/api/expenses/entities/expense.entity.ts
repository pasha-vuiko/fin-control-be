import { ExpenseCategory } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

import { IExpense } from '@api/expenses/interfaces/expense.interface';

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
