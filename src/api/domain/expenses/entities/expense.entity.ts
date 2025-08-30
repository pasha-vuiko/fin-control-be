import { ExpenseCategory } from '@prisma-definitions/client/client';

import { ApiProperty } from '@nestjs/swagger';

import { ClassFields } from '@shared/types/exclude-methods.type';
import { Prettify } from '@shared/types/prettify.type';

export class ExpenseEntity {
  id: string;

  customerId: string;

  date: Date;

  amount: number;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  createdAt: Date;

  updatedAt: Date;

  constructor(data: Prettify<ClassFields<ExpenseEntity>>) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.date = data.date;
    this.amount = data.amount;
    this.category = data.category;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static fromExpenseObj(
    data: Prettify<ClassFields<ExpenseEntity>>,
  ): ExpenseEntity {
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
