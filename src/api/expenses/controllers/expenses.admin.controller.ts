import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';

import { ExpensesFindDto } from '@api/expenses/dto/expenses-find.dto';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { ExpensesService } from '@api/expenses/services/expenses.service';

@ApiTags('Admin/Expenses')
@Controller('admin/expenses')
export class ExpensesAdminController {
  constructor(private readonly expensesService: ExpensesService) {}

  @ApiPagePaginatedRes(ExpenseEntity)
  @Auth(Roles.ADMIN)
  @Get()
  async findMany(
    @Query() findDto: ExpensesFindDto,
  ): Promise<PagePaginationResEntity<ExpenseEntity>> {
    const { page, numOfItems } = findDto;

    const { items, total } = await this.expensesService.findManyAsAdmin({
      page,
      numOfItems,
    });

    return { items, total, page, numOfItems: items.length };
  }

  @Auth(Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ExpenseEntity> {
    return this.expensesService.findOneAsAdmin(id);
  }
}
