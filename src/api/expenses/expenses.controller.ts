import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // TODO Move part of functionality to AdminModule
  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get()
  findMany(@User() user: IUser): Promise<ExpenseEntity[]> {
    return this.expensesService.findMany(user.id, user.roles);
  }

  // TODO Move part of functionality to AdminModule
  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    return this.expensesService.findOne(id, user.id, user.roles);
  }

  // TODO Move part of functionality to AdminModule
  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity> {
    return this.expensesService.create(createExpenseDto, user.id);
  }

  // TODO Move part of functionality to AdminModule
  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity> {
    return this.expensesService.update(id, updateExpenseDto, user);
  }

  // TODO Move part of functionality to AdminModule
  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    return this.expensesService.delete(id, user.id, user.roles);
  }
}
