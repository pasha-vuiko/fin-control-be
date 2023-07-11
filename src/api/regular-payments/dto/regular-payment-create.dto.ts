import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';

import { ExpenseCategory } from '../../../../prisma/client';

export class RegularPaymentCreateDto
  implements Omit<IRegularPaymentCreateInput, 'customerId'>
{
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  category: ExpenseCategory;

  @IsDateString()
  @IsNotEmpty()
  dateOfCharge: string;
}
