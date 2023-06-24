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

import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { JsonCache } from '@shared/modules/redis/decorators/json-cache.decorator';

import { FindExpensesDto } from '@api/expenses/dto/find-expenses.dto';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @JsonCache()
  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get()
  findMany(
    @Query() findDto: FindExpensesDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity[]> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.expensesService.findManyAsAdmin(findDto);
    }

    return this.expensesService.findManyAsCustomer(user.id, findDto);
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @JsonCache()
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.expensesService.findOneAsAdmin(id);
    }

    return this.expensesService.findOneAsCustomer(id, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @ApiBody({ type: [CreateExpenseDto] })
  @Post()
  create(
    @Body()
    createExpenseDTOs: CreateExpenseDto[],
    @User() user: IUser,
  ): Promise<ExpenseEntity[]> {
    if (!Array.isArray(createExpenseDTOs)) {
      throw new BadRequestException('body should be an array');
    }

    return this.expensesService.createMany(createExpenseDTOs, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity> {
    return this.expensesService.update(id, updateExpenseDto, user.id);
  }

  @Auth(Roles.CUSTOMER)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    return this.expensesService.delete(id, user.id);
  }
}
