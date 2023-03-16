import { Controller, Get, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';

@ApiTags('[Admin] Expenses')
@Controller('admin/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Auth(Roles.ADMIN)
  @Get()
  findMany(): Promise<ExpenseEntity[]> {
    return this.expensesService.findMany();
  }

  @Auth(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ExpenseEntity> {
    return this.expensesService.findOne(id);
  }
}
