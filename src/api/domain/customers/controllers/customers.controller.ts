import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Auth } from '@shared/modules/auth/decorators/auth.decorator';
import { User } from '@shared/modules/auth/decorators/user.decorator';
import { Roles } from '@shared/modules/auth/enums/roles';
import { IUser } from '@shared/modules/auth/interfaces/user.interface';
import { ApiAppExceptionsRes } from '@shared/modules/error/open-api/api-app-exceptions-response.decorator';

import { CustomerEntity } from '@api/domain/customers/entities/customer.entity';
import {
  CustomerNotFoundException,
  ForbiddenToDeleteCustomerException,
} from '@api/domain/customers/exceptions/exception-classes';

import { CustomerCreateDto } from '../dto/customer-create.dto';
import { CustomerUpdateDto } from '../dto/customer-update.dto';
import { CustomersService } from '../services/customers.service';

// TODO Add method to change customers Email and Phone
@ApiTags('Customers')
@Controller('customers')
@Auth(Roles.CUSTOMER)
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @ApiAppExceptionsRes(CustomerNotFoundException)
  @Get('self')
  findSelf(@User() user: IUser): Promise<CustomerEntity> {
    return this.customerService.findOneByUserId(user.id);
  }

  @Post()
  create(
    @Body() createCustomerDto: CustomerCreateDto,
    @User() user: IUser,
  ): Promise<CustomerEntity> {
    return this.customerService.create(createCustomerDto, user);
  }

  @ApiAppExceptionsRes(CustomerNotFoundException)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @User() user: IUser,
    @Body() updateCustomerDto: CustomerUpdateDto,
  ): Promise<CustomerEntity> {
    return this.customerService.updateAsCustomer(id, updateCustomerDto, user.id);
  }

  @ApiAppExceptionsRes(CustomerNotFoundException, ForbiddenToDeleteCustomerException)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser): Promise<CustomerEntity> {
    return this.customerService.removeAsCustomer(id, user.id);
  }
}
