import { ExpenseCategory } from '@prisma-definitions/client/client';

import { ApiProperty } from '@nestjs/swagger';

import { IExpense } from '@api/domain/expenses/interfaces/expense.interface';

export class ExpenseEntity implements IExpense {
  id: string;

  customerId: string;

  date: Date;

  amount: number;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  createdAt: Date;

  updatedAt: Date;

  constructor(data: IExpense) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.date = data.date;
    this.amount = data.amount;
    this.category = data.category;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static fromExpenseObj(data: IExpense): ExpenseEntity {
    return new ExpenseEntity({
      id: data.id,
      customerId: data.customerId,
      date: data.date,
      amount: data.amount,
      category: data.category,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
