import { ExpenseCategory } from '@prisma/client';

import { ApiProperty } from '@nestjs/swagger';

import { IRegularPayment } from '@api/regular-payments/interfaces/regular-payment.interface';

export class RegularPaymentEntity implements Omit<IRegularPayment, 'amount'> {
  id: string;

  customerId: string;

  amount: number;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  dateOfCharge: Date;

  createdAt: Date;

  updatedAt: Date;
}
