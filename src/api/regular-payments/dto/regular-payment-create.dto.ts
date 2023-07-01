import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

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
  category: ExpenseCategory; // TODO Replace with self implemented enum

  @IsDateString()
  @IsNotEmpty()
  dateOfCharge: string;
}
