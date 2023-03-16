import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { ExpenseEntity } from '@api/expenses/entities/expense.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get()
  findMany(@User() user: IUser): Promise<ExpenseEntity[]> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.expensesService.findManyAsAdmin();
    }

    return this.expensesService.findManyAsCustomer(user.id);
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.expensesService.findOneAsAdmin(id);
    }

    return this.expensesService.findOneAsCustomer(id, user.id);
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Post()
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity> {
    return this.expensesService.create(createExpenseDto, user.id);
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @User() user: IUser,
  ): Promise<ExpenseEntity> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.expensesService.updateAsAdmin(id, updateExpenseDto, 'mockCustomerId');
    }

    return this.expensesService.updateAsCustomer(id, updateExpenseDto, user.id);
  }

  @Auth(Roles.CUSTOMER, Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser): Promise<ExpenseEntity> {
    if (user.roles.includes(Roles.ADMIN)) {
      return this.expensesService.deleteAsAdmin(id);
    }

    return this.expensesService.deleteAsCustomer(id, user.id);
  }
}
