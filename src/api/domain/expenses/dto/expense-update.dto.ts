import { PartialType } from '@nestjs/swagger';

import { ExpenseCreateDto } from './expense-create.dto';

export class ExpenseUpdateDto extends PartialType(ExpenseCreateDto) {}
