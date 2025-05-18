import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { ApiPagePaginatedRes } from '@shared/decorators/swagger/api-page-pagineted-res.decorator';
import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { JsonCache } from '@shared/modules/cache/decorators/json-cache.decorator';
import { ApiAppExceptionsRes } from '@shared/modules/error/open-api/api-app-exceptions-response.decorator';

import { ExpensesFindDto } from '@api/expenses/dto/expenses-find.dto';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { ExpenseIsNotFoundException } from '@api/expenses/exceptions/exception-classes';

import { ExpenseCreateDto } from '../dto/expense-create.dto';
import { ExpenseUpdateDto } from '../dto/expense-update.dto';
import { ExpensesService } from '../services/expenses.service';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @ApiPagePaginatedRes(ExpenseEntity)
  @JsonCache()
  @Auth(Roles.CUSTOMER)
  @Get()
  async findMany(
    @Query() findDto: ExpensesFindDto,
    @User() user: IUser,
  ): Promise<PagePaginationResEntity<ExpenseEntity>> {
    const { page, numOfItems } = findDto;

    const { items, total } = await this.expensesService.findManyAsCustomer(user.id, {
      page,
      numOfItems,
    });

    return { items, total, page, numOfItems };
  }

  @ApiAppExceptionsRes(ExpenseIsNotFoundException)
  @JsonCache()
  @Auth(Roles.CUSTOMER)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    return this.expensesService.findOneAsCustomer(id, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @ApiBody({ type: [ExpenseCreateDto] })
  @Post()
  create(
    @Body() expensesToCreate: ExpenseCreateDto[],
    @User() user: IUser,
  ): Promise<ExpenseEntity[]> {
    if (!Array.isArray(expensesToCreate)) {
      throw new BadRequestException('body should be an array');
    }

    return this.expensesService.createMany(expensesToCreate, user.id);
  }

  @ApiAppExceptionsRes(ExpenseIsNotFoundException)
  @Auth(Roles.CUSTOMER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: ExpenseUpdateDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity> {
    return this.expensesService.update(id, updateExpenseDto, user.id);
  }

  @ApiAppExceptionsRes(ExpenseIsNotFoundException)
  @Auth(Roles.CUSTOMER)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    return this.expensesService.delete(id, user.id);
  }
}
