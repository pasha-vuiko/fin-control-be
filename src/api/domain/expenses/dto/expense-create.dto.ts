import { ExpenseCategory } from '@prisma-definitions/client/client';
import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { IsDecimalNum } from '@shared/decorators/validation/is-decimal-num.decorator';

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
