import { ExpenseCategory } from '@prisma-definitions/client/client';

import { ApiProperty } from '@nestjs/swagger';

import { ClassFields } from '@shared/types/exclude-methods.type';
import { Prettify } from '@shared/types/prettify.type';

export class RegularPaymentEntity {
  id: string;

  customerId: string;

  amount: number;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  dateOfCharge: Date;

  createdAt: Date;

  updatedAt: Date;

  constructor(data: Prettify<ClassFields<RegularPaymentEntity>>) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.amount = data.amount;
    this.category = data.category;
    this.dateOfCharge = data.dateOfCharge;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static fromPlainObj(
    data: Prettify<ClassFields<RegularPaymentEntity>>,
  ): RegularPaymentEntity {
    return new RegularPaymentEntity(data);
  }
}
