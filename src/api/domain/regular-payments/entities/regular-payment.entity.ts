import { ExpenseCategory } from '@prisma-definitions/client/client';

import { ApiProperty } from '@nestjs/swagger';

import { IRegularPayment } from '@api/domain/regular-payments/interfaces/regular-payment.interface';

export class RegularPaymentEntity implements IRegularPayment {
  id: string;

  customerId: string;

  amount: number;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  dateOfCharge: Date;

  createdAt: Date;

  updatedAt: Date;

  constructor(data: IRegularPayment) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.amount = data.amount;
    this.category = data.category;
    this.dateOfCharge = data.dateOfCharge;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public static fromPlainObj(data: IRegularPayment): RegularPaymentEntity {
    return new RegularPaymentEntity(data);
  }
}
