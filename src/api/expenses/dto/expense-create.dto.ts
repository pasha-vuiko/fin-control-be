import { ExpenseCategory } from '@prisma-definitions/client';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IsDecimalNum } from '@shared/decorators/validation/is-decimal-num.decorator';

import { IExpenseCreateInput } from '@api/expenses/interfaces/expense-create-input.interface';

export class ExpenseCreateDto implements Omit<IExpenseCreateInput, 'customerId'> {
  @IsDecimalNum()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ type: Date })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ enum: Object.keys(ExpenseCategory) })
  @IsNotEmpty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;
}
