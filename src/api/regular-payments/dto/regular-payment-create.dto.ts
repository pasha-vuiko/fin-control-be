import { ExpenseCategory } from '@prisma-definitions/client';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IRegularPaymentCreateInput } from '@api/regular-payments/interfaces/regular-payment-create-input.interface';

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

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  dateOfCharge: string;
}
