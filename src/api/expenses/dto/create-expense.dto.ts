import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IsDecimalNum } from '@shared/decorators/validation/is-decimal-num.decorator';

import { ICreateExpenseInput } from '@api/expenses/interfaces/create-expense-input.interface';

import { ExpenseCategory } from '../../../../prisma/client';

export class CreateExpenseDto implements Omit<ICreateExpenseInput, 'customerId'> {
  @IsDecimalNum()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  @IsNotEmpty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;
}
