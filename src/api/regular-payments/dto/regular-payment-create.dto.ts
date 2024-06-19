import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ExpenseCategory } from '@api/expenses/enum/expense-category.enum';

export class RegularPaymentCreateDto {
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
