import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IsDecimalNum } from '@shared/decorators/validation/is-decimal-num.decorator';

import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';

export class ExpenseCreateDto {
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
